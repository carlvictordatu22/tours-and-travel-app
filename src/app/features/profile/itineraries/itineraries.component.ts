import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { EmptyCardComponent } from '../../../shared/components/empty-card/empty-card.component';
import { FavoritesService, ItinerariesService } from '../../../shared/services';
import { Entry, StoredItinerary } from '../../../shared/interface';

@Component({
    selector: 'tnt-profile-itineraries',
    standalone: true,
    imports: [CommonModule, CardComponent, EmptyCardComponent],
    templateUrl: './itineraries.component.html',
    styleUrls: ['./itineraries.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileItinerariesComponent {
    // Dependencies (user preference: place inject() at the top)
    readonly #itineraries = inject(ItinerariesService);
    readonly #favorites = inject(FavoritesService);

    // Data sources
    readonly itineraries = signal<StoredItinerary[]>(this.#itineraries.list());
    readonly allEntries = computed(() => this.#favorites.entries());

    /**
     * Formats an ISO date string into a localized short date, e.g., Mon, Jan 1.
     * @param iso ISO date string
     */
    formatDateISO(iso: string): string {
        const date = new Date(iso);

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Formats a start/end ISO date pair as a range.
     * @param startISO Start ISO date string
     * @param endISO End ISO date string
     */
    formatDateRange(startISO: string, endISO: string): string {
        const start = new Date(startISO);
        const end = new Date(endISO);
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `${startStr} - ${endStr}`;
    }

    /**
     * Maps a list of entry IDs to full `Entry` objects.
     * @param ids The list of entry identifiers
     */
    getEntriesByIds(ids: string[]): Entry[] {
        const entries = this.allEntries();

        return entries.filter((entry) => ids.includes(entry.id));
    }

    /**
     * Counts the total number of selected entry IDs across all days for an itinerary.
     * @param itinerary The stored itinerary record
     */
    countItineraryEntries(itinerary: StoredItinerary): number {
        return itinerary.dailyEntries.reduce((sum, day) => sum + (day.selectedEntryIds?.length ?? 0), 0);
    }
}
