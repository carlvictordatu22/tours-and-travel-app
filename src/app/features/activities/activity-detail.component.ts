import { ChangeDetectionStrategy, Component, Signal, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ENTRIES, Entry, EntryType, FavoritesService } from '../../shared';

@Component({
  selector: 'tnt-activity-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #favoritesService = inject(FavoritesService);
  
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activity = signal<Entry | null>(null);

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Subscribes to route parameters to load the activity data.
   */
  ngOnInit(): void {
    this.#route.params.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.#loadActivity(id);
      }
    });
  }

  /**
   * Navigates back to the activities list page.
   */
  onBackClick(): void {
    this.#router.navigate(['/activities']);
  }

  /**
   * Toggles the favorite status of the current activity.
   * Updates both the favorites service and the dummy data to keep UI in sync.
   */
  onFavoriteToggle(): void {
    const currentActivity = this.activity();
    if (currentActivity) {
      const newFavoriteState = this.#favoritesService.toggleFavorite(currentActivity.id);
      
      // Update the activity's favorite status in dummy data to keep UI in sync
      const entry = ENTRIES.find(e => e.id === currentActivity.id);
      if (entry) {
        entry.isFavorite = newFavoriteState;
      }
    }
  }

  /**
   * Checks if the current activity is marked as favorite.
   * @returns {boolean} True if the activity is favorited, false otherwise.
   */
  isFavorite(): boolean {
    const currentActivity = this.activity();
    return currentActivity ? this.#favoritesService.isFavorite(currentActivity.id) : false;
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
   * Retrieves the duration hours for the current activity.
   * @returns {string} The duration in hours or 'Varies' if not specified.
   */
  getDurationHours(): string {
    const currentActivity = this.activity();
    if (currentActivity && 'durationHours' in currentActivity) {
      return (currentActivity as any).durationHours;
    }
    return 'Varies';
  }

  /**
   * Loads activity data based on the provided ID.
   * @param {string} id - The unique identifier of the activity to load.
   */
  #loadActivity(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Find the activity in dummy data
    const foundActivity = ENTRIES.find(entry => 
      entry.id === id && entry.type === EntryType.ACTIVITY
    );

    if (foundActivity) {
      this.activity.set(foundActivity);
    } else {
      this.error.set('Activity not found');
    }

    this.isLoading.set(false);
  }
} 