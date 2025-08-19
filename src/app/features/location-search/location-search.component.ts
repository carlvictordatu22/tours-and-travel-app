import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { CardComponent, EmptyCardComponent, Entries, Entry, EntryType, FavoritesService, Location, PaginationComponent, SkeletonComponent } from '../../shared';

@Component({
    selector: 'tnt-location-search',
    imports: [CommonModule, CardComponent, PaginationComponent, EmptyCardComponent, SkeletonComponent],
    templateUrl: './location-search.component.html',
    styleUrl: './location-search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationSearchComponent {
    readonly #route = inject(ActivatedRoute);
    readonly #router = inject(Router);
    readonly #favorites = inject(FavoritesService);

    readonly isLoading = signal(false);

    readonly pageSize = 12;
    readonly page = signal<number>(1);

    /** Route param as a `Location` enum value when valid, otherwise `null`. */
    readonly selectedLocation = signal<Location | null>(null);

    readonly displayText = computed(() => this.selectedLocation() ?? '');

    /** All entries filtered by the selected location. */
    readonly allForLocation: Signal<Entries> = computed(() => {
        const loc = this.selectedLocation();
        if (!loc) {
            return [];
        }

        return this.#favorites
            .entries()
            .filter(
                (entry: Entry) =>
                    (entry.type === EntryType.ACTIVITY || entry.type === EntryType.HOTEL || entry.type === EntryType.RESTAURANT) && entry.location === loc
            );
    });

    readonly totalEntries = computed(() => this.allForLocation().length);
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalEntries() / this.pageSize)));

    readonly pagedEntries: Signal<Entries> = computed(() => {
        const current = Math.min(this.totalPages(), Math.max(1, this.page()));
        const start = (current - 1) * this.pageSize;
        const end = start + this.pageSize;

        return this.allForLocation().slice(start, end);
    });

    readonly entries$ = toObservable(this.pagedEntries);

    constructor() {
        // Initialize from route param
        this.#route.paramMap.subscribe((params) => {
            const raw = params.get('location') ?? '';
            const value = this.#normalizeToLocation(raw);
            this.selectedLocation.set(value);
            // Reset page on location change
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

        // Show skeleton only for page or location changes (not for favorite toggles)
        effect(() => {
            this.page();
            this.selectedLocation();
            this.isLoading.set(true);
            const timeout = setTimeout(() => this.isLoading.set(false), 3000);

            return () => clearTimeout(timeout);
        });
    }

    /** Update favorite state via the global FavoritesService */
    onFavoriteChange(id: string, value: boolean): void {
        this.#favorites.setFavorite(id, value);
    }

    /** Normalizes raw route param to `Location` enum; returns `null` if invalid. */
    #normalizeToLocation(value: string): Location | null {
        const candidates = Object.values(Location);

        return (candidates as string[]).includes(value) ? (value as Location) : null;
    }
}
