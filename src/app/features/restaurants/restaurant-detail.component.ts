import { ChangeDetectionStrategy, Component, Signal, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ENTRIES, Entry, EntryType, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-restaurant-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrl: './restaurant-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestaurantDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #favoritesService = inject(FavoritesService);
  
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly restaurant = signal<Entry | null>(null);

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Subscribes to route parameters to load the restaurant data.
   */
  ngOnInit(): void {
    this.#route.params.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.#loadRestaurant(id);
      }
    });
  }

  /**
   * Navigates back to the restaurants list page.
   */
  onBackClick(): void {
    this.#router.navigate(['/restaurants']);
  }

  /**
   * Toggles the favorite status of the current restaurant.
   * Updates both the favorites service and the dummy data to keep UI in sync.
   */
  onFavoriteToggle(): void {
    const currentRestaurant = this.restaurant();
    if (currentRestaurant) {
      const newFavoriteState = this.#favoritesService.toggleFavorite(currentRestaurant.id);
      
      // Update the restaurant's favorite status in dummy data to keep UI in sync
      const entry = ENTRIES.find(e => e.id === currentRestaurant.id);
      if (entry) {
        entry.isFavorite = newFavoriteState;
      }
    }
  }

  /**
   * Checks if the current restaurant is marked as favorite.
   * @returns {boolean} True if the restaurant is favorited, false otherwise.
   */
  isFavorite(): boolean {
    const currentRestaurant = this.restaurant();
    return currentRestaurant ? this.#favoritesService.isFavorite(currentRestaurant.id) : false;
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
   * Retrieves the review count for the current restaurant.
   * @returns {number | null} The review count or null if not specified.
   */
  getReviewCount(): number | null {
    const currentRestaurant = this.restaurant();
    if (currentRestaurant && 'reviewCount' in currentRestaurant) {
      return (currentRestaurant as any).reviewCount;
    }
    return null;
  }

  /**
   * Checks if the current restaurant has a review count available.
   * @returns {boolean} True if review count is available, false otherwise.
   */
  hasReviewCount(): boolean {
    return this.getReviewCount() !== null;
  }

  /**
   * Loads restaurant data based on the provided ID.
   * @param {string} id - The unique identifier of the restaurant to load.
   */
  #loadRestaurant(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Find the restaurant in dummy data
    const foundRestaurant = ENTRIES.find((entry: Entry) => 
      entry.id === id && entry.type === EntryType.RESTAURANT
    );

    if (foundRestaurant) {
      this.restaurant.set(foundRestaurant);
    } else {
      this.error.set('Restaurant not found');
    }

    this.isLoading.set(false);
  }
} 