import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent, SkeletonComponent, Location, EmptyCardComponent, FavoritesService } from '../../shared';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'tnt-activities',
  imports: [CommonModule, ReactiveFormsModule, CardComponent, PaginationComponent, SkeletonComponent, EmptyCardComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(FormBuilder);
  readonly #favorites = inject(FavoritesService);

  readonly isLoading = signal(false);

  readonly pageSize = 12;
  readonly page = signal<number>(1);

  readonly allActivities: Signal<Entries> = computed(() =>
    this.#favorites.entries().filter((entry: Entry) => entry.type === EntryType.ACTIVITY)
  );

  readonly filterForm = this.#fb.nonNullable.group({
    name: '',
    location: '' as '' | Location,
    isFavorite: false
  });

  readonly #nameCtrl = this.filterForm.controls.name;
  readonly #locationCtrl = this.filterForm.controls.location;
  readonly #isFavoriteCtrl = this.filterForm.controls.isFavorite;

  readonly nameQuery = toSignal(
    this.#nameCtrl.valueChanges.pipe(
      startWith(this.#nameCtrl.value),
      debounceTime(1500),
      distinctUntilChanged()
    ),
    { initialValue: this.#nameCtrl.value }
  );

  readonly locationFilter = toSignal(
    this.#locationCtrl.valueChanges.pipe(
      startWith(this.#locationCtrl.value),
      distinctUntilChanged()
    ),
    { initialValue: this.#locationCtrl.value }
  );

  readonly isFavoriteFilter = toSignal(
    this.#isFavoriteCtrl.valueChanges.pipe(
      startWith(this.#isFavoriteCtrl.value),
      distinctUntilChanged()
    ),
    { initialValue: this.#isFavoriteCtrl.value }
  );

  readonly locationOptions = signal(Object.values(Location));

  readonly filteredActivities: Signal<Entries> = computed(() => {
    const normalizedName = (this.nameQuery() ?? '').trim().toLowerCase();
    const location = this.locationFilter();
    const isFavorite = this.isFavoriteFilter();

    return this.allActivities().filter((entry: Entry) => {
      const matchesName = normalizedName
        ? entry.title.toLowerCase().includes(normalizedName)
        : true;
      const matchesLocation = location
        ? entry.location === (location as Location)
        : true;
      const matchesFavorite = isFavorite ? entry.isFavorite === true : true;

      return matchesName && matchesLocation && matchesFavorite;
    });
  });

  readonly totalActivities = computed(() => this.filteredActivities().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalActivities() / this.pageSize)));

  readonly activities: Signal<Entries> = computed(() => {
    const current = Math.min(this.totalPages(), Math.max(1, this.page()));
    const start = (current - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredActivities().slice(start, end);
  });

  readonly activities$: Observable<Entries> = toObservable(this.activities);

  /** Bootstraps page state from URL and keeps it synced with the query param. */
  constructor() {
    // Reset page when filters change (name debounced; others immediate)
    effect(() => {
      this.nameQuery();
      this.locationFilter();
      this.isFavoriteFilter();
      this.page.set(1);
    });
    
    // Read the initial '?page' on first load.
    const initial = Number(this.#route.snapshot.queryParamMap.get('page'));
    if (Number.isFinite(initial) && initial > 0) {
      this.page.set(Math.floor(initial));
    }

    // Keep '?page' in sync with the current page; omit it on page 1.
    effect(() => {
      const current = this.page();
      const currentParam = this.#route.snapshot.queryParamMap.get('page');
      const normalized = current !== 1 ? String(current) : null;
      const shouldUpdate = (normalized ?? null) !== (currentParam ?? null);
      
      if (shouldUpdate) {
        this.#router.navigate([], {
          relativeTo: this.#route,
          queryParams: { page: normalized },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });

    // Show skeleton only for filter/page changes (not for favorite toggles)
    effect(() => {
      // These are user-driven controls; favorite heart toggles do not touch them
      this.page();
      this.nameQuery();
      this.locationFilter();
      this.isFavoriteFilter();

      this.isLoading.set(true);
      const timeout = setTimeout(() => this.isLoading.set(false), 3000);
      return () => clearTimeout(timeout);
    });
  }

  /** Update favorite state via the global FavoritesService */
  onFavoriteChange(id: string, value: boolean): void {
    this.#favorites.setFavorite(id, value);
  }
}
