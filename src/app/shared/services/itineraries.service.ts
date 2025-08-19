import { Injectable } from '@angular/core';
import { ItineraryDraft, StoredItinerary } from '../interface';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.ITINERARIES;

@Injectable({ providedIn: 'root' })
export class ItinerariesService {
    /**
     * Returns all persisted itineraries from localStorage.
     * - Safely handles malformed JSON or storage access errors by returning an empty array.
     */
    list(): StoredItinerary[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            return raw ? (JSON.parse(raw) as StoredItinerary[]) : [];
        } catch {
            return [];
        }
    }

    /**
     * Persists a draft itinerary to localStorage.
     * - Generates a unique ID for the itinerary.
     * - Serializes Date values to ISO strings.
     * - Merges with any existing stored itineraries.
     *
     * @param draft The itinerary draft collected from the UI.
     * @returns The stored itinerary record as saved.
     */
    save(draft: ItineraryDraft): StoredItinerary {
        const id =
            globalThis.crypto && 'randomUUID' in globalThis.crypto
                ? (globalThis.crypto as Crypto).randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const stored: StoredItinerary = {
            id,
            itineraryName: draft.itineraryName,
            startDateISO: draft.startDate ? draft.startDate.toISOString() : '',
            endDateISO: draft.endDate ? draft.endDate.toISOString() : '',
            days: draft.days,
            thumbnailDataUrl: draft.thumbnailDataUrl,
            dailyEntries: draft.dailyEntries.map((dailyEntry) => ({
                dateISO: dailyEntry.date ? dailyEntry.date.toISOString() : '',
                selectedEntryIds: dailyEntry.selectedEntryIds ?? []
            })),
            createdAtISO: new Date().toISOString()
        };

        const existing = this.list();
        existing.push(stored);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        } catch {
            // ignore storage errors
        }

        return stored;
    }
}
