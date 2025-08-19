import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, CardComponent, EmptyCardComponent, FavoritesService, PaginationComponent } from '../../../shared';
import { Entries, Entry, EntryType } from '../../../shared';

@Component({
    selector: 'tnt-profile-favorites',
    standalone: true,
    imports: [CommonModule, CardComponent, PaginationComponent, EmptyCardComponent, ButtonComponent],
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFavoritesComponent {
    readonly #favorites = inject(FavoritesService);

    readonly pageSize = 12;
    readonly page = signal<number>(1);
    /** Currently selected entry type filter. `null` means all types. */
    readonly selectedType = signal<EntryType | null>(null);
    /** Expose enum to template. */
    readonly EntryType = EntryType;

    /** All entries that are currently marked as favorite. */
    readonly allFavorites: Signal<Entries> = computed(() => this.#favorites.entries().filter((entry: Entry) => entry.isFavorite === true));

    /** Favorites narrowed by entry type. */
    readonly filteredFavorites: Signal<Entries> = computed(() => {
        const type = this.selectedType();
        const favorites = this.allFavorites();

        return type ? favorites.filter((entry) => entry.type === type) : favorites;
    });

    /** Total favorites count. */
    readonly totalFavorites = computed(() => this.filteredFavorites().length);

    /** Total number of pages based on page size. */
    readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalFavorites() / this.pageSize)));

    /** Current page slice of favorites. */
    readonly favorites: Signal<Entries> = computed(() => {
        const current = Math.min(this.totalPages(), Math.max(1, this.page()));
        const start = (current - 1) * this.pageSize;
        const end = start + this.pageSize;

        return this.filteredFavorites().slice(start, end);
    });

    constructor() {
        // Ensure `page` never exceeds the available number of pages
        effect(() => {
            const max = this.totalPages();
            const current = this.page();
            if (current > max) {
                this.page.set(max);
            }
        });

        // Reset to page 1 whenever the type filter changes
        effect(() => {
            this.selectedType();
            this.page.set(1);
        });
    }

    /**
     * Updates favorite state via the global FavoritesService.
     * @param id Entry identifier
     * @param value Target favorite state
     */
    onFavoriteChange(id: string, value: boolean): void {
        this.#favorites.setFavorite(id, value);
    }

    /**
     * Updates the selected entry type filter.
     * @param type Entry type or `null` for all
     */
    setSelectedType(type: EntryType | null): void {
        this.selectedType.set(type);
    }
}
