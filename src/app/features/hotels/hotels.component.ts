import { ChangeDetectionStrategy, Component, Signal, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent, SkeletonComponent, LocationFilterService, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-hotels',
  imports: [CommonModule, RouterModule, CardComponent, PaginationComponent, SkeletonComponent],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #locationFilterService = inject(LocationFilterService);
  readonly #favoritesService = inject(FavoritesService);
  
  readonly isLoading = signal(true);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 12;
  
  // Global location filter
  readonly globalLocationFilter = this.#locationFilterService.locationFilter;
  
  readonly allHotels: Signal<Entries> = computed(() => 
    ENTRIES.filter((entry: Entry) => entry.type === EntryType.HOTEL)
  );
  
  readonly filteredHotels: Signal<Entries> = computed(() => {
    let hotels = this.allHotels();
    
    // Apply global location filter (navbar)
    if (this.globalLocationFilter().isActive) {
      hotels = hotels.filter((hotel: Entry) => 
        hotel.location === this.globalLocationFilter().selectedLocation
      );
    }
    
    return hotels;
  });
  
  readonly totalPages: Signal<number> = computed(() => 
    Math.ceil(this.filteredHotels().length / this.itemsPerPage)
  );
  
  readonly hotels: Signal<Entries> = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredHotels().slice(startIndex, endIndex);
  });

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Syncs dummy data with favorites, sets up route parameter handling, and initializes loading state.
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

    // Artificial delay for skeleton loading
    setTimeout(() => {
      this.isLoading.set(false);
    }, 3000);
  }

  /**
   * Handles page navigation changes and updates the URL accordingly.
   * @param {number} page - The target page number to navigate to.
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
   * Toggles the favorite status of an entry and updates the dummy data to keep UI in sync.
   * @param {Object} event - Object containing the entry and its new favorite status.
   * @param {Entry} event.entry - The entry to toggle favorite status for.
   * @param {boolean} event.isFavorite - The new favorite status.
   */
  onFavoriteToggle(event: { entry: Entry; isFavorite: boolean }): void {
    // Update the entry's favorite status in the dummy data to keep UI in sync
    const entry = ENTRIES.find(e => e.id === event.entry.id);
    if (entry) {
      entry.isFavorite = event.isFavorite;
    }
  }

  /**
   * Syncs dummy data entries with localStorage favorites.
   * Updates all entries to reflect their favorite status from localStorage.
   */
  #syncDummyDataWithFavorites(): void {
    const favoriteIds = this.#favoritesService.getFavoriteIds();
    
    // Update all entries to reflect their favorite status from localStorage
    ENTRIES.forEach((entry: Entry) => {
      entry.isFavorite = favoriteIds.includes(entry.id);
    });
  }
}
