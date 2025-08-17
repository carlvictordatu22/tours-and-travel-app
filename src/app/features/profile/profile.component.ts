import { ChangeDetectionStrategy, Component, Signal, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ENTRIES, Entry, EntryType, ItineraryService, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  readonly #itineraryService = inject(ItineraryService);
  readonly #favoritesService = inject(FavoritesService);
  readonly #router = inject(Router);

  // User info (hard-coded for demo, except totalTrips which is dynamic)
  readonly userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: 'January 2024'
  };

  // Computed total trips count from actual itineraries
  readonly totalTrips = computed(() => this.#itineraryService.itineraries().length);

  // Computed favorite count from actual favorites
  readonly favoriteCount = computed(() => this.allFavorites().length);

  // Favorite type filter
  readonly selectedFavoriteType = signal<EntryType | 'all'>('all');
  readonly favoriteTypes = [
    { value: 'all', label: 'All Favorites', icon: '⭐' },
    { value: EntryType.ACTIVITY, label: 'Activities', icon: '🎯' },
    { value: EntryType.HOTEL, label: 'Hotels', icon: '🏨' },
    { value: EntryType.RESTAURANT, label: 'Restaurants', icon: '🍽️' }
  ];

  // All favorites from localStorage
  readonly allFavorites: Signal<Entry[]> = computed(() => {
    const favoriteIds = this.#favoritesService.getFavoriteIds();
    const favorites = ENTRIES.filter((entry: Entry) => favoriteIds.includes(entry.id));
    
    return favorites;
  });

  // Filtered favorites based on selected type
  readonly filteredFavorites: Signal<Entry[]> = computed(() => {
    const favorites = this.allFavorites();
    const selectedType = this.selectedFavoriteType();
    
    if (selectedType === 'all') {
      return favorites;
    }
    
    return favorites.filter((favorite: Entry) => favorite.type === selectedType);
  });

  // Itineraries from localStorage
  readonly itineraries = this.#itineraryService.itineraries;

  // Make EntryType available in template
  readonly EntryType = EntryType;

  /**
   * Handles favorite type filter dropdown changes.
   * Updates the selected favorite type to filter the favorites list.
   * @param {Event} event - The select change event.
   */
  onFavoriteTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFavoriteType.set(target.value as EntryType | 'all');
  }

  /**
   * Navigates to the detail page of a favorite entry based on its type.
   * Routes to the appropriate detail component (activities, hotels, or restaurants).
   * @param {Entry} entry - The entry to navigate to.
   */
  onFavoriteCardClick(entry: Entry): void {
    let route: string;
    switch (entry.type) {
      case EntryType.ACTIVITY:
        route = `/activities/${entry.id}`;
        break;
      case EntryType.HOTEL:
        route = `/hotels/${entry.id}`;
        break;
      case EntryType.RESTAURANT:
        route = `/restaurants/${entry.id}`;
        break;
      default:
        return;
    }
    this.#router.navigate([route]);
  }

  /**
   * Handles clicks on itinerary entries, navigating to their detail pages.
   * Delegates to the favorite card click handler for consistent navigation.
   * @param {Entry} entry - The itinerary entry to navigate to.
   */
  onItineraryEntryClick(entry: Entry): void {
    this.onFavoriteCardClick(entry);
  }

  /**
   * Formats a date range into a readable string format.
   * @param {Date} startDate - The start date of the range.
   * @param {Date} endDate - The end date of the range.
   * @returns {string} Formatted date range string (e.g., "Jan 15 - Jan 20").
   */
  formatDateRange(startDate: Date, endDate: Date): string {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${start} - ${end}`;
  }

  /**
   * Calculates the total number of entries across all days in an itinerary.
   * @param {any} itinerary - The itinerary object containing days and entries.
   * @returns {number} The total count of all entries in the itinerary.
   */
  getTotalEntriesForItinerary(itinerary: any): number {
    return itinerary.days.reduce((total: number, day: any) => total + day.entries.length, 0);
  }

  /**
   * Formats a day date into a readable string format.
   * @param {Date} date - The date to format.
   * @returns {string} Formatted date string (e.g., "Monday, January 15").
   */
  formatDayDate(date: Date): string {
    const dayDate = new Date(date);
    return dayDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Returns the appropriate icon emoji based on the entry type.
   * @param {EntryType} type - The type of entry (activity, hotel, restaurant, etc.)
   * @returns {string} The emoji icon representing the entry type.
   */
  getFavoriteTypeIcon(type: EntryType): string {
    switch (type) {
      case EntryType.ACTIVITY: return '🎯';
      case EntryType.HOTEL: return '🏨';
      case EntryType.RESTAURANT: return '🍽️';
      default: return '📍';
    }
  }
}
