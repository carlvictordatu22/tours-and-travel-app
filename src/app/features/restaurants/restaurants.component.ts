import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
    CardComponent,
    Entries,
    Entry,
    EntryType,
    PaginationComponent,
    SkeletonComponent,
    EmptyCardComponent,
    FavoritesService,
    Location,
    Restaurant
} from '../../shared';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'tnt-restaurants',
    imports: [CommonModule, ReactiveFormsModule, CardComponent, PaginationComponent, SkeletonComponent, EmptyCardComponent, ButtonComponent],
    templateUrl: './restaurants.component.html',
    styleUrl: './restaurants.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestaurantsComponent {
    readonly #router = inject(Router);
    readonly #route = inject(ActivatedRoute);
    readonly #fb = inject(FormBuilder);
    readonly #favorites = inject(FavoritesService);

    readonly isLoading = signal(false);

    readonly pageSize = 12;
    readonly page = signal<number>(1);

    readonly allRestaurants: Signal<Entries> = computed(() => this.#favorites.entries().filter((entry: Entry) => entry.type === EntryType.RESTAURANT));

    readonly filterForm = this.#fb.nonNullable.group({
        name: '',
        location: '' as '' | Location,
        isFavorite: false
    });

    readonly #nameCtrl = this.filterForm.controls.name;
    readonly #locationCtrl = this.filterForm.controls.location;
    readonly #isFavoriteCtrl = this.filterForm.controls.isFavorite;

    readonly nameQuery = toSignal(this.#nameCtrl.valueChanges.pipe(startWith(this.#nameCtrl.value), debounceTime(1500), distinctUntilChanged()), {
        initialValue: this.#nameCtrl.value
    });

    readonly locationFilter = toSignal(this.#locationCtrl.valueChanges.pipe(startWith(this.#locationCtrl.value), distinctUntilChanged()), {
        initialValue: this.#locationCtrl.value
    });

    readonly isFavoriteFilter = toSignal(this.#isFavoriteCtrl.valueChanges.pipe(startWith(this.#isFavoriteCtrl.value), distinctUntilChanged()), {
        initialValue: this.#isFavoriteCtrl.value
    });

    readonly locationOptions = signal(Object.values(Location));

    readonly filteredRestaurants: Signal<Entries> = computed(() => {
        const normalizedName = (this.nameQuery() ?? '').trim().toLowerCase();
        const location = this.locationFilter();
        const isFavorite = this.isFavoriteFilter();

        return this.allRestaurants().filter((entry: Entry) => {
            const matchesName = normalizedName ? entry.title.toLowerCase().includes(normalizedName) : true;
            const matchesLocation = location ? entry.location === (location as Location) : true;
            const matchesFavorite = isFavorite ? entry.isFavorite === true : true;

            return matchesName && matchesLocation && matchesFavorite;
        });
    });

    readonly totalRestaurants = computed(() => this.filteredRestaurants().length);
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRestaurants() / this.pageSize)));

    readonly restaurants: Signal<Entries> = computed(() => {
        const current = Math.min(this.totalPages(), Math.max(1, this.page()));
        const start = (current - 1) * this.pageSize;
        const end = start + this.pageSize;

        return this.filteredRestaurants().slice(start, end);
    });

    readonly restaurants$: Observable<Entries> = toObservable(this.restaurants);

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

    /** Clears all filters (name, location, favorite) and resets to first page */
    clearSearch(): void {
        this.filterForm.reset({ name: '', location: '', isFavorite: false }, { emitEvent: true });
        this.page.set(1);
    }

    /** Template type guard */
    isRestaurant(entry: Entry): entry is Restaurant {
        return entry.type === EntryType.RESTAURANT;
    }
}
