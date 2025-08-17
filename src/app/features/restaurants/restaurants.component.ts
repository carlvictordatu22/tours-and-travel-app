import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent, SkeletonComponent, EmptyCardComponent, FavoritesService } from '../../shared';
import { Observable } from 'rxjs';
 
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tnt-restaurants',
  imports: [CommonModule, CardComponent, PaginationComponent, SkeletonComponent, EmptyCardComponent],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestaurantsComponent {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #favorites = inject(FavoritesService);

  readonly isLoading = signal(false);

  readonly pageSize = 12;
  readonly page = signal<number>(1);

  readonly allRestaurants: Signal<Entries> = computed(() =>
    this.#favorites.entries().filter((entry: Entry) => entry.type === EntryType.RESTAURANT)
  );

  readonly totalRestaurants = computed(() => this.allRestaurants().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRestaurants() / this.pageSize)));

  readonly restaurants: Signal<Entries> = computed(() => {
    const current = Math.min(this.totalPages(), Math.max(1, this.page()));
    const start = (current - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allRestaurants().slice(start, end);
  });

  readonly restaurants$: Observable<Entries> = toObservable(this.restaurants);

  /** Bootstraps page state from URL and keeps it synced with the query param. */
  constructor() {
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

    // Show skeleton only when page changes
    effect(() => {
      this.page();
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
