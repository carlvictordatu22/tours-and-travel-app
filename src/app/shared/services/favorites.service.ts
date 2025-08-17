import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  readonly #FAVORITES_KEY = 'tnt_favorites';
  readonly #platformId = inject(PLATFORM_ID);
  
  // Signal to track favorite IDs
  readonly #favoriteIds = signal<Set<string>>(new Set());
  
  // Computed signal for all favorite entries
  readonly favorites = computed(() => {
    const ids = this.#favoriteIds();
    return Array.from(ids);
  });

  constructor() {
    this.#loadFavoritesFromStorage();
  }

  /**
   * Check if an entry is favorited
   * @param entryId - The ID of the entry to check
   * @returns True if the entry is favorited
   */
  isFavorite(entryId: string): boolean {
    return this.#favoriteIds().has(entryId);
  }

  /**
   * Toggle favorite status for an entry
   * @param entryId - The ID of the entry to toggle
   * @returns True if the entry is now favorited, false if removed
   */
  toggleFavorite(entryId: string): boolean {
    const currentIds = this.#favoriteIds();
    const newIds = new Set(currentIds);
    
    if (newIds.has(entryId)) {
      newIds.delete(entryId);
    } else {
      newIds.add(entryId);
    }
    
    this.#favoriteIds.set(newIds);
    this.#saveFavoritesToStorage();
    
    return newIds.has(entryId);
  }

  /**
   * Add an entry to favorites
   * @param entryId - The ID of the entry to add
   */
  addFavorite(entryId: string): void {
    const currentIds = this.#favoriteIds();
    if (!currentIds.has(entryId)) {
      const newIds = new Set(currentIds);
      newIds.add(entryId);
      this.#favoriteIds.set(newIds);
      this.#saveFavoritesToStorage();
    }
  }

  /**
   * Remove an entry from favorites
   * @param entryId - The ID of the entry to remove
   */
  removeFavorite(entryId: string): void {
    const currentIds = this.#favoriteIds();
    if (currentIds.has(entryId)) {
      const newIds = new Set(currentIds);
      newIds.delete(entryId);
      this.#favoriteIds.set(newIds);
      this.#saveFavoritesToStorage();
    }
  }

  /**
   * Get all favorite entry IDs
   * @returns Array of favorite entry IDs
   */
  getFavoriteIds(): string[] {
    return Array.from(this.#favoriteIds());
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): void {
    this.#favoriteIds.set(new Set());
    this.#saveFavoritesToStorage();
  }

  /**
   * Get count of favorites
   * @returns The total number of favorited entries
   */
  getFavoriteCount(): number {
    return this.#favoriteIds().size;
  }

  /**
   * Check if we're running in a browser environment
   * @returns True if running in browser
   */
  #isBrowser(): boolean {
    return isPlatformBrowser(this.#platformId);
  }

  /**
   * Load favorites from localStorage on service initialization
   */
  #loadFavoritesFromStorage(): void {
    if (!this.#isBrowser()) {
      return; // Skip on server-side
    }

    try {
      const stored = localStorage.getItem(this.#FAVORITES_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        this.#favoriteIds.set(new Set(ids));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      // Reset to empty set if there's an error
      this.#favoriteIds.set(new Set());
    }
  }

  /**
   * Save favorites to localStorage
   */
  #saveFavoritesToStorage(): void {
    if (!this.#isBrowser()) {
      return; // Skip on server-side
    }

    try {
      const ids = Array.from(this.#favoriteIds());
      localStorage.setItem(this.#FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
} 