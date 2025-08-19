import { Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { ENTRIES } from '../constants';
import { Entries } from '../interface';

const STORAGE_KEY = 'tnt_favorites';

/**
 * Favorites state manager.
 * Persists favorite IDs to localStorage and exposes decorated `entries`.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
    readonly #favoriteIds: WritableSignal<Set<string>> = signal(new Set<string>());

    /**
     * Entries with `isFavorite` derived from the current favorites set.
     */
    readonly entries: Signal<Entries> = computed(() => {
        const current = this.#favoriteIds();
        return ENTRIES.map((entry) => ({ ...entry, isFavorite: current.has(entry.id) }));
    });

    /** Total number of favorites. */
    readonly favoritesCount: Signal<number> = computed(() => this.entries().filter((entry) => entry.isFavorite).length);

    /** Loads persisted favorites and wires up persistence effects. */
    constructor() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as string[];
                if (Array.isArray(parsed)) {
                    this.#favoriteIds.set(new Set(parsed));
                }
            }
        } catch {
            // ignore storage errors
        }

        // Sync ENTRIES with the loaded favorites
        this.#syncEntriesFromSet();

        // Persist favorites whenever they change
        effect(() => {
            const ids = Array.from(this.#favoriteIds());
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
            } catch {
                // ignore storage errors
            }
        });
    }

    /**
     * Checks if an entry is currently marked as favorite.
     * @param id Entry identifier
     * @returns True if favorite
     */
    isFavorite(id: string): boolean {
        return this.#favoriteIds().has(id);
    }

    /**
     * Toggles favorite state for the given entry.
     * @param id Entry identifier
     */
    toggleFavorite(id: string): void {
        const isFav = this.isFavorite(id);
        this.setFavorite(id, !isFav);
    }

    /**
     * Sets favorite state explicitly for the given entry.
     * @param id Entry identifier
     * @param value Target favorite state
     */
    setFavorite(id: string, value: boolean): void {
        const next = new Set(this.#favoriteIds());
        if (value) {
            next.add(id);
        } else {
            next.delete(id);
        }
        this.#favoriteIds.set(next);
        this.#applyFavoriteToEntries(id, value);
    }

    // Sync helpers
    /**
     * Mirrors favorite state onto the corresponding entry in `ENTRIES`.
     * @param id Entry identifier
     * @param value Favorite state to apply
     */
    #applyFavoriteToEntries(id: string, value: boolean): void {
        const target = ENTRIES.find((e) => e.id === id);
        if (target) {
            target.isFavorite = value;
        }
    }

    /** Syncs all entries' `isFavorite` flags from the favorites set. */
    #syncEntriesFromSet(): void {
        const current = this.#favoriteIds();
        for (const entry of ENTRIES) {
            entry.isFavorite = current.has(entry.id);
        }
    }
}
