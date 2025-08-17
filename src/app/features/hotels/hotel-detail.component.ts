import { ChangeDetectionStrategy, Component, Signal, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ENTRIES, Entry, EntryType, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-hotel-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-detail.component.html',
  styleUrl: './hotel-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #favoritesService = inject(FavoritesService);
  
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly hotel = signal<Entry | null>(null);

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Subscribes to route parameters to load the hotel data.
   */
  ngOnInit(): void {
    this.#route.params.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.#loadHotel(id);
      }
    });
  }

  /**
   * Navigates back to the hotels list page.
   */
  onBackClick(): void {
    this.#router.navigate(['/hotels']);
  }

  /**
   * Toggles the favorite status of the current hotel.
   * Updates both the favorites service and the dummy data to keep UI in sync.
   */
  onFavoriteToggle(): void {
    const currentHotel = this.hotel();
    if (currentHotel) {
      const newFavoriteState = this.#favoritesService.toggleFavorite(currentHotel.id);
      
      // Update the hotel's favorite status in dummy data to keep UI in sync
      const entry = ENTRIES.find(e => e.id === currentHotel.id);
      if (entry) {
        entry.isFavorite = newFavoriteState;
      }
    }
  }

  /**
   * Checks if the current hotel is marked as favorite.
   * @returns {boolean} True if the hotel is favorited, false otherwise.
   */
  isFavorite(): boolean {
    const currentHotel = this.hotel();
    return currentHotel ? this.#favoritesService.isFavorite(currentHotel.id) : false;
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

  /**
   * Capitalizes the first letter of a location string.
   * @param {string} location - The location string to format.
   * @returns {string} The location string with the first letter capitalized.
   */
  getLocationName(location: string): string {
    return location.charAt(0).toUpperCase() + location.slice(1);
  }

  /**
   * Retrieves the review count for the current hotel.
   * @returns {number | null} The review count or null if not specified.
   */
  getReviewCount(): number | null {
    const currentHotel = this.hotel();
    if (currentHotel && 'reviewCount' in currentHotel) {
      return (currentHotel as any).reviewCount;
    }
    return null;
  }

  /**
   * Checks if the current hotel has a review count available.
   * @returns {boolean} True if review count is available, false otherwise.
   */
  hasReviewCount(): boolean {
    return this.getReviewCount() !== null;
  }

  /**
   * Loads hotel data based on the provided ID.
   * @param {string} id - The unique identifier of the hotel to load.
   */
  #loadHotel(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Find the hotel in dummy data
    const foundHotel = ENTRIES.find((entry: Entry) => 
      entry.id === id && entry.type === EntryType.HOTEL
    );

    if (foundHotel) {
      this.hotel.set(foundHotel);
    } else {
      this.error.set('Hotel not found');
    }

    this.isLoading.set(false);
  }
} 