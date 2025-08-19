import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateItineraryComponent } from '../create-itinerary';
import { MODAL_PANEL_CLASS, MODAL_WIDTH } from '../../constants';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '../../enums';

@Component({
    selector: 'tnt-navbar',
    imports: [CommonModule, RouterLink, RouterLinkActive, MatDialogModule, FormsModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
    readonly #dialog = inject(MatDialog);
    readonly #router = inject(Router);

    /** List of available locations for autocomplete overlay */
    readonly locations = signal<string[]>(Object.values(Location));

    /** Currently selected search query (shown in the input) */
    readonly searchQuery = signal<string>('');

    /** Normalized query used for filtering */
    readonly normalizedQuery = computed(() => this.searchQuery().trim().toLowerCase());

    /** Filtered locations that include the current query */
    readonly filteredLocations = computed(() => {
        const query = this.normalizedQuery();

        if (!query) {
            return [];
        }

        return this.locations().filter((loc) => loc.toLowerCase().includes(query));
    });

    /**
     * Opens the create itinerary dialog modal
     */
    openCreateItineraryDialog(): void {
        this.#dialog.open(CreateItineraryComponent, {
            width: MODAL_WIDTH,
            panelClass: MODAL_PANEL_CLASS,
            hasBackdrop: true,
            autoFocus: false
        });
    }

    /**
     * Sets the selected location as the current search query
     */
    onChooseLocation(location: string, event?: Event): void {
        this.searchQuery.set('');
        (event?.currentTarget as HTMLElement | undefined)?.blur();
        this.#router.navigate(['/location-search', location]);
    }

    /** Updates the query from input events */
    onInputQuery(event: Event): void {
        const value = (event.target as HTMLInputElement | null)?.value ?? '';
        this.searchQuery.set(value);
    }

    /** If user presses Enter, go to the first match if any */
    onEnter(): void {
        const first = this.filteredLocations()[0];
        if (first) {
            this.onChooseLocation(first);
        }
    }

    constructor() {
        // Clear query on any navigation end
        this.#router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                this.searchQuery.set('');
            }
        });
    }
}
