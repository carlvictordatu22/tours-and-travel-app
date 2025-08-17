import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Itinerary, ItineraryDay } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class ItineraryService {
  readonly #STORAGE_KEY = 'tnt_itineraries';
  readonly #platformId = inject(PLATFORM_ID);
  readonly #_itineraries = signal<Itinerary[]>([]);

  readonly itineraries = this.#_itineraries.asReadonly();

  constructor() {
    this.#loadItineraries();
  }

  /**
   * Create a new itinerary
   * @param itinerary - The itinerary data without id, createdAt, and updatedAt
   * @returns The newly created itinerary with generated id and timestamps
   */
  createItinerary(itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Itinerary {
    const newItinerary: Itinerary = {
      ...itinerary,
      id: this.#generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.#_itineraries();
    this.#_itineraries.set([...current, newItinerary]);
    this.#saveItineraries();
    return newItinerary;
  }

  /**
   * Update an existing itinerary
   * @param id - The ID of the itinerary to update
   * @param updates - Partial updates to apply to the itinerary
   * @returns The updated itinerary or null if not found
   */
  updateItinerary(id: string, updates: Partial<Itinerary>): Itinerary | null {
    const current = this.#_itineraries();
    const index = current.findIndex((it: Itinerary) => it.id === id);
    
    if (index === -1) return null;

    const updatedItinerary: Itinerary = {
      ...current[index],
      ...updates,
      updatedAt: new Date()
    };

    current[index] = updatedItinerary;
    this.#_itineraries.set([...current]);
    this.#saveItineraries();
    return updatedItinerary;
  }

  /**
   * Delete an itinerary by ID
   * @param id - The ID of the itinerary to delete
   * @returns True if deleted successfully, false if not found
   */
  deleteItinerary(id: string): boolean {
    const current = this.#_itineraries();
    const filtered = current.filter((it: Itinerary) => it.id !== id);
    
    if (filtered.length === current.length) return false;
    
    this.#_itineraries.set(filtered);
    this.#saveItineraries();
    return true;
  }

  /**
   * Get an itinerary by ID
   * @param id - The ID of the itinerary to retrieve
   * @returns The itinerary or null if not found
   */
  getItinerary(id: string): Itinerary | null {
    return this.#_itineraries().find((it: Itinerary) => it.id === id) || null;
  }

  /**
   * Generate itinerary days from a date range
   * @param startDate - The start date of the itinerary
   * @param endDate - The end date of the itinerary
   * @returns Array of itinerary days
   */
  generateDaysFromRange(startDate: Date, endDate: Date): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    // Normalize dates to midnight to avoid time-based issues
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (currentDate <= end) {
      days.push({
        date: new Date(currentDate),
        entries: []
      });

      // Move to next day (avoid mutating the original date object)
      currentDate.setTime(currentDate.getTime() + (1000 * 60 * 60 * 24));
    }

    return days;
  }

  /**
   * Validate a date range for itinerary creation
   * @param startDate - The start date to validate
   * @param endDate - The end date to validate
   * @returns Validation result with success status and optional message
   */
  validateDateRange(startDate: Date, endDate: Date): { isValid: boolean; message?: string } {
    if (startDate >= endDate) {
      return { isValid: false, message: 'End date must be after start date' };
    }

    // Calculate days difference using UTC dates to avoid timezone issues
    const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = endUTC - startUTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive
    
    if (diffDays > 7) {
      return { isValid: false, message: 'Maximum 7 days allowed' };
    }

    return { isValid: true };
  }

  /**
   * Check if an entry can be added to a specific day
   * @param day - The itinerary day to check
   * @returns True if an entry can be added (less than 5 entries)
   */
  canAddEntryToDay(day: ItineraryDay): boolean {
    return day.entries.length < 5;
  }

  /**
   * Get the remaining capacity for entries in a specific day
   * @param day - The itinerary day to check
   * @returns The number of remaining entry slots (0-5)
   */
  getRemainingCapacity(day: ItineraryDay): number {
    return Math.max(0, 5 - day.entries.length);
  }

  /**
   * Check if we're running in a browser environment
   * @returns True if running in browser
   */
  #isBrowser(): boolean {
    return isPlatformBrowser(this.#platformId);
  }

  /**
   * Load itineraries from localStorage on service initialization
   */
  #loadItineraries(): void {
    if (!this.#isBrowser()) {
      return; // Skip on server-side
    }

    try {
      const stored = localStorage.getItem(this.#STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const itineraries = parsed.map((itinerary: any) => ({
          ...itinerary,
          startDate: new Date(itinerary.startDate),
          endDate: new Date(itinerary.endDate),
          days: itinerary.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          })),
          createdAt: new Date(itinerary.createdAt),
          updatedAt: new Date(itinerary.updatedAt)
        }));
        this.#_itineraries.set(itineraries);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
      this.#_itineraries.set([]);
    }
  }

  /**
   * Save itineraries to localStorage
   */
  #saveItineraries(): void {
    if (!this.#isBrowser()) {
      return; // Skip on server-side
    }

    try {
      localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(this.#_itineraries()));
    } catch (error) {
      console.error('Error saving itineraries:', error);
    }
  }

  /**
   * Generate a unique ID for new itineraries
   * @returns A unique string ID
   */
  #generateId(): string {
    return 'ITIN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
} 