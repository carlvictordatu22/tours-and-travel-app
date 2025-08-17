import { Injectable, signal } from '@angular/core';
import { Location } from '../enums';

export interface LocationFilterState {
  selectedLocation: Location | '';
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LocationFilterService {
  readonly #_locationFilter = signal<LocationFilterState>({
    selectedLocation: '',
    isActive: false
  });

  readonly locationFilter = this.#_locationFilter.asReadonly();

  /**
   * Set the location filter to a specific location
   * @param location - The location to filter by, or empty string to clear
   */
  setLocationFilter(location: Location | ''): void {
    this.#_locationFilter.set({
      selectedLocation: location,
      isActive: location !== ''
    });
  }

  /**
   * Clear the current location filter
   */
  clearLocationFilter(): void {
    this.#_locationFilter.set({
      selectedLocation: '',
      isActive: false
    });
  }

  /**
   * Get the currently selected location filter
   * @returns The selected location or empty string if none selected
   */
  getSelectedLocation(): Location | '' {
    return this.#_locationFilter().selectedLocation;
  }

  /**
   * Check if a location filter is currently active
   * @returns True if a location filter is active
   */
  isLocationFilterActive(): boolean {
    return this.#_locationFilter().isActive;
  }
} 