import { ChangeDetectionStrategy, Component, input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Entry } from '../../interface';
import { EntryType } from '../../enums';
import { FavoritesService } from '../../services';

@Component({
  selector: 'tnt-card',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  readonly #router = inject(Router);
  readonly #favoritesService = inject(FavoritesService);

  // Legacy inputs for backward compatibility
  imageUrl = input<string>('');
  title = input<string>('');
  description = input<string>('');

  // New input for full entry data
  entry = input<Entry | null>(null);

  // Optional navigation inputs
  enableNavigation = input<boolean>(true);
  entryType = input<EntryType | null>(null);

  // Image optimization inputs
  loadWithPriority = input<boolean>(false);

  // Output for favorite toggle
  @Output() favoriteToggle = new EventEmitter<{ entry: Entry; isFavorite: boolean }>();

  /**
   * Handles card click events and navigates to the appropriate detail page.
   * Only navigates if navigation is enabled and an entry exists.
   */
  onCardClick(): void {
    if (!this.enableNavigation() || !this.entry()) {
      return;
    }

    const entry = this.entry();
    if (entry) {
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
  }

  /**
   * Handles favorite toggle events and emits the new favorite state.
   * Prevents event propagation to avoid triggering card click.
   * @param {Event} event - The click event that triggered the favorite toggle.
   */
  onFavoriteToggle(event: Event): void {
    event.stopPropagation(); // Prevent card click when clicking heart
    
    const entry = this.entry();
    if (entry) {
      const newFavoriteState = this.#favoritesService.toggleFavorite(entry.id);
      this.favoriteToggle.emit({ 
        entry, 
        isFavorite: newFavoriteState 
      });
    }
  }

  /**
   * Gets the image URL for the card, prioritizing entry data over legacy input.
   * @returns {string} The image URL to display on the card.
   */
  getCardImageUrl(): string {
    return this.entry()?.imageUrl || this.imageUrl();
  }

  /**
   * Gets the title for the card, prioritizing entry data over legacy input.
   * @returns {string} The title to display on the card.
   */
  getCardTitle(): string {
    return this.entry()?.title || this.title();
  }

  /**
   * Gets the description for the card, prioritizing entry data over legacy input.
   * @returns {string} The description to display on the card.
   */
  getCardDescription(): string {
    return this.entry()?.description || this.description();
  }

  /**
   * Gets the entry type for the card, prioritizing entry data over legacy input.
   * @returns {EntryType | null} The type of entry or null if not specified.
   */
  getCardType(): EntryType | null {
    return this.entry()?.type || this.entryType();
  }

  /**
   * Gets the location for the card from the entry data.
   * @returns {string} The location string or empty string if not available.
   */
  getCardLocation(): string {
    return this.entry()?.location || '';
  }

  /**
   * Gets the rating for the card from the entry data.
   * @returns {number} The rating value or 0 if not available.
   */
  getCardRating(): number {
    return this.entry()?.rating || 0;
  }

  /**
   * Gets the price for the card from the entry data.
   * @returns {number} The price in USD or 0 if not available.
   */
  getCardPrice(): number {
    return this.entry()?.priceUsd || 0;
  }

  /**
   * Returns the appropriate icon emoji based on the card's entry type.
   * @returns {string} The emoji icon representing the entry type.
   */
  getCardTypeIcon(): string {
    const type = this.getCardType();
    switch (type) {
      case EntryType.ACTIVITY: return '🎯';
      case EntryType.HOTEL: return '🏨';
      case EntryType.RESTAURANT: return '🍽️';
      default: return '📍';
    }
  }

  /**
   * Checks if the current entry is marked as favorite.
   * @returns {boolean} True if the entry is favorited, false otherwise.
   */
  isFavorite(): boolean {
    const entry = this.entry();
    return entry ? this.#favoritesService.isFavorite(entry.id) : false;
  }

  /**
   * Gets the image dimensions for NgOptimizedImage based on card type.
   * Provides appropriate aspect ratios for different content types.
   * @returns {{width: number, height: number}} The width and height for the image.
   */
  getImageDimensions(): { width: number; height: number } {
    const type = this.getCardType();
    
    // Different aspect ratios for different content types
    switch (type) {
      case EntryType.ACTIVITY:
        return { width: 800, height: 600 }; // 4:3 ratio for activities
      case EntryType.HOTEL:
        return { width: 800, height: 500 }; // 8:5 ratio for hotels
      case EntryType.RESTAURANT:
        return { width: 800, height: 600 }; // 4:3 ratio for restaurants
      default:
        return { width: 800, height: 600 }; // Default 4:3 ratio
    }
  }

  /**
   * Determines if the image should be loaded with priority based on input or default behavior.
   * @returns {boolean} True if the image should load with priority.
   */
  shouldLoadWithPriority(): boolean {
    // Use the input priority if provided, otherwise fall back to default behavior
    return this.loadWithPriority() || false;
  }

  /**
   * Gets the image fill mode for NgOptimizedImage.
   * @returns {string} The fill mode for the image.
   */
  getImageFillMode(): string {
    return 'cover'; // Ensures the image covers the entire container
  }

  /**
   * Gets the image loading mode for NgOptimizedImage.
   * @returns {string} The loading mode for the image.
   */
  getImageLoadingMode(): string {
    return this.shouldLoadWithPriority() ? 'eager' : 'lazy';
  }

  /**
   * Gets the image placeholder for NgOptimizedImage.
   * @returns {string} The placeholder type for the image.
   */
  getImagePlaceholder(): string {
    return 'blur'; // Shows a blurred version while loading
  }

  /**
   * Gets the image quality for NgOptimizedImage.
   * @returns {number} The quality setting for the image (1-100).
   */
  getImageQuality(): number {
    return 85; // Good balance between quality and file size
  }
}
