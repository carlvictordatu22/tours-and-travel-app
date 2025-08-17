import { ChangeDetectionStrategy, Component, Signal, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, ENTRIES, Entries, Entry, OpenAIService, SearchResult, SkeletonComponent, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-ai-search',
  imports: [CommonModule, FormsModule, CardComponent, SkeletonComponent],
  templateUrl: './ai-search.component.html',
  styleUrl: './ai-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AISearchComponent implements OnInit {
  readonly #openaiService = inject(OpenAIService);
  readonly #favoritesService = inject(FavoritesService);

  readonly searchQuery = signal('');
  readonly isSearching = signal(false);
  readonly searchResults = signal<SearchResult | null>(null);
  readonly foundEntries = signal<Entries>([]);
  readonly hasSearched = signal(false);

  readonly allEntries: Signal<Entries> = computed(() => ENTRIES);

  // Computed favorite count for the current search results
  readonly favoriteCount = computed(() => 
    this.foundEntries().filter((entry: Entry) => entry.isFavorite).length
  );

  // Computed total count for the current search results
  readonly totalCount = computed(() => this.foundEntries().length);

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Syncs dummy data with localStorage favorites.
   */
  ngOnInit(): void {
    // Sync dummy data with localStorage favorites
    this.#syncDummyDataWithFavorites();
  }

  /**
   * Performs AI-powered search based on the current search query.
   * Updates search results and found entries based on AI recommendations.
   */
  onSearch(): void {
    const query = this.searchQuery().trim();
    if (!query) return;

    this.isSearching.set(true);
    this.hasSearched.set(true);

    this.#openaiService.searchRelevantItems(query, this.allEntries()).subscribe({
      next: (result: SearchResult) => {
        this.searchResults.set(result);
        
        // Find the actual entry objects based on the IDs returned by AI
        const foundItems = this.allEntries().filter((entry: Entry) => 
          result.results.includes(entry.id)
        );
        this.foundEntries.set(foundItems);
        
        this.isSearching.set(false);
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.searchResults.set({
          query: query,
          results: [],
          reasoning: 'An error occurred during the search. Please try again.'
        });
        this.foundEntries.set([]);
        this.isSearching.set(false);
      }
    });
  }

  /**
   * Updates the search query when the input field value changes.
   * @param {Event} event - The input change event.
   */
  onQueryChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  /**
   * Handles keyboard events, specifically Enter key to trigger search.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  /**
   * Clears the current search query and resets all search-related state.
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set(null);
    this.foundEntries.set([]);
    this.hasSearched.set(false);
  }

  /**
   * Toggles the favorite status of an entry and updates both dummy data and UI.
   * @param {Object} event - Object containing the entry and its new favorite status.
   * @param {Entry} event.entry - The entry to toggle favorite status for.
   * @param {boolean} event.isFavorite - The new favorite status.
   */
  onFavoriteToggle(event: { entry: Entry; isFavorite: boolean }): void {
    // Update the entry's favorite status in the dummy data to keep UI in sync
    const entry = ENTRIES.find(e => e.id === event.entry.id);
    if (entry) {
      entry.isFavorite = event.isFavorite;
    }
    
    // Update the found entries to reflect the change immediately
    const updatedFoundEntries = this.foundEntries().map((foundEntry: Entry) => {
      if (foundEntry.id === event.entry.id) {
        return { ...foundEntry, isFavorite: event.isFavorite };
      }
      return foundEntry;
    });
    this.foundEntries.set(updatedFoundEntries);
  }

  /**
   * Syncs dummy data entries with localStorage favorites.
   * Updates all entries to reflect their favorite status from localStorage.
   */
  #syncDummyDataWithFavorites(): void {
    const favoriteIds = this.#favoritesService.getFavoriteIds();
    
    // Update all entries to reflect their favorite status from localStorage
    ENTRIES.forEach((entry: Entry) => {
      entry.isFavorite = favoriteIds.includes(entry.id);
    });
  }
}
