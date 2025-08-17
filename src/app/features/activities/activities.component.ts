import { ChangeDetectionStrategy, Component, Signal, computed, signal, OnInit, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent, SkeletonComponent, Location, LocationFilterService, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-activities',
  imports: [CommonModule, RouterModule, FormsModule, CardComponent, PaginationComponent, SkeletonComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #locationFilterService = inject(LocationFilterService);
  readonly #favoritesService = inject(FavoritesService);
  readonly #destroy$ = new Subject<void>();
  readonly #nameFilterSubject$ = new Subject<string>();
  
  readonly isLoading = signal(true);
  readonly isFiltering = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 12;
  
  // Filter signals
  readonly nameFilter = signal('');
  readonly locationFilter = signal<Location | ''>('');
  readonly showFavoritesOnly = signal(false);
  
  // Global location filter
  readonly globalLocationFilter = this.#locationFilterService.locationFilter;
  
  // Available locations for filter dropdown
  readonly availableLocations = Object.values(Location);
  
  readonly allActivities: Signal<Entries> = computed(() => 
    ENTRIES.filter((entry: Entry) => entry.type === EntryType.ACTIVITY)
  );
  
  readonly filteredActivities: Signal<Entries> = computed(() => {
    let activities = this.allActivities();
    
    // Apply name filter (case-insensitive)
    if (this.nameFilter()) {
      const searchTerm = this.nameFilter().toLowerCase();
      activities = activities.filter((activity: Entry) => 
        activity.title.toLowerCase().includes(searchTerm) ||
        activity.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply local location filter (component-specific)
    if (this.locationFilter()) {
      activities = activities.filter((activity: Entry) => 
        activity.location === this.locationFilter()
      );
    }
    
    // Apply global location filter (navbar)
    if (this.globalLocationFilter().isActive) {
      activities = activities.filter((activity: Entry) => 
        activity.location === this.globalLocationFilter().selectedLocation
      );
    }
    
    // Apply favorites filter
    if (this.showFavoritesOnly()) {
      activities = activities.filter((activity: Entry) => 
        this.#favoritesService.isFavorite(activity.id)
      );
    }
    
    return activities;
  });
  
  readonly totalPages: Signal<number> = computed(() => 
    Math.ceil(this.filteredActivities().length / this.itemsPerPage)
  );
  
  readonly activities: Signal<Entries> = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredActivities().slice(startIndex, endIndex);
  });

  constructor() {
    // Watch for global location filter changes and clear local filters
    effect(() => {
      const globalFilter = this.globalLocationFilter();
      if (globalFilter.isActive) {
        // Clear local filters when global filter is active
        this.nameFilter.set('');
        this.locationFilter.set('');
        this.showFavoritesOnly.set(false);
        this.#resetToFirstPage();
      }
    });
  }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Syncs dummy data with favorites, sets up route parameter handling, and initializes the name filter.
   */
  ngOnInit(): void {
    // Sync dummy data with localStorage favorites
    this.#syncDummyDataWithFavorites();
    
    this.#route.queryParams.subscribe((params: any) => {
      const page = parseInt(params['page'] || '1', 10);
      if (page >= 1 && page <= this.totalPages()) {
        this.currentPage.set(page);
      } else {
        this.currentPage.set(1);
      }
    });

    // Setup debounced name filter
    this.#setupNameFilter();

    // Artificial delay for skeleton loading
    setTimeout(() => {
      this.isLoading.set(false);
    }, 3000);
  }

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   * Completes the destroy subject to clean up subscriptions.
   */
  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  /**
   * Handles name filter input changes with debouncing
   * @param event - The input change event
   */
  onNameFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.#nameFilterSubject$.next(target.value);
  }

  /**
   * Handles location filter dropdown changes
   * @param event - The select change event
   */
  onLocationFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.isFiltering.set(true);
    this.locationFilter.set(target.value as Location | '');
    this.#resetToFirstPage();
    
    // Small delay to show filtering state
    setTimeout(() => {
      this.isFiltering.set(false);
    }, 100);
  }

  /**
   * Toggles the favorites-only filter on/off
   */
  onFavoritesToggle(): void {
    this.isFiltering.set(true);
    this.showFavoritesOnly.update((value: boolean) => !value);
    this.#resetToFirstPage();
    
    // Small delay to show filtering state
    setTimeout(() => {
      this.isFiltering.set(false);
    }, 100);
  }

  /**
   * Handles favorite toggle events for individual entries
   * @param event - Object containing entry and favorite status
   */
  onFavoriteToggle(event: { entry: Entry; isFavorite: boolean }): void {
    // Update the entry's favorite status in the dummy data to keep UI in sync
    const entry = ENTRIES.find(e => e.id === event.entry.id);
    if (entry) {
      entry.isFavorite = event.isFavorite;
    }
  }

  /**
   * Clears all active filters and resets to first page
   */
  clearFilters(): void {
    this.isFiltering.set(true);
    this.nameFilter.set('');
    this.locationFilter.set('');
    this.showFavoritesOnly.set(false);
    this.#resetToFirstPage();
    
    // Small delay to show filtering state
    setTimeout(() => {
      this.isFiltering.set(false);
    }, 100);
  }

  /**
   * Handles page navigation changes
   * @param page - The target page number
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.#router.navigate([], {
        relativeTo: this.#route,
        queryParams: { page },
        queryParamsHandling: 'merge'
      });
    }
  }


  /**
   * Sync dummy data entries with localStorage favorites.
   * Updates all entries to reflect their favorite status from localStorage.
   */
  #syncDummyDataWithFavorites(): void {
    const favoriteIds = this.#favoritesService.getFavoriteIds();
    
    // Update all entries to reflect their favorite status from localStorage
    ENTRIES.forEach(entry => {
      entry.isFavorite = favoriteIds.includes(entry.id);
    });
  }

  /**
   * Sets up the debounced name filter with a 300ms delay.
   * Subscribes to name filter changes and applies filtering with debouncing.
   */
  #setupNameFilter(): void {
    this.#nameFilterSubject$
      .pipe(
        debounceTime(300), // 300ms delay
        distinctUntilChanged(), // Only emit when value changes
        takeUntil(this.#destroy$)
      )
      .subscribe((searchTerm: string) => {
        this.isFiltering.set(true);
        this.nameFilter.set(searchTerm);
        this.#resetToFirstPage();
        
        // Small delay to show filtering state
        setTimeout(() => {
          this.isFiltering.set(false);
        }, 100);
      });
  }

  /**
   * Resets the current page to the first page and updates the URL accordingly.
   * Called when filters are applied to ensure results start from the beginning.
   */
  #resetToFirstPage(): void {
    this.currentPage.set(1);
    // Update URL to reflect first page
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge'
    });
  }
}
