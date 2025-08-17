import { ChangeDetectionStrategy, Component, Signal, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { 
  ENTRIES, 
  Entries, 
  Entry, 
  EntryType, 
  Location, 
  ItineraryService,
  Itinerary,
  ItineraryDay
} from '../../index';

@Component({
  selector: 'tnt-create-itinerary',
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressBarModule
  ],
  templateUrl: './create-itinerary.component.html',
  styleUrl: './create-itinerary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateItineraryComponent implements OnInit, OnDestroy {
  readonly #fb = inject(FormBuilder);
  readonly #dialogRef = inject(MatDialogRef<CreateItineraryComponent>);
  readonly #itineraryService = inject(ItineraryService);
  readonly #snackBar = inject(MatSnackBar);
  readonly #destroy$ = new Subject<void>();

  // Form
  itineraryForm!: FormGroup;
  filterForm!: FormGroup;

  // State
  readonly isLoading = signal(false);
  readonly selectedThumbnail = signal<string>('');
  readonly selectedDateRange = signal<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  readonly generatedDays = signal<ItineraryDay[]>([]);
  readonly selectedEntries = signal<Map<string, Entry[]>>(new Map());

  // Available options
  readonly entryTypes = Object.values(EntryType);
  readonly locations = Object.values(Location);

  // Date filter function to prevent selecting dates that exceed 7 days
  readonly endDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    const startDate = this.itineraryForm.get('startDate')?.value;
    if (!startDate) return true; // Allow selection if no start date yet
    
    const start = new Date(startDate);
    const end = new Date(date);
    
    // Reset time to midnight to avoid time-based issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Don't allow dates before start date
    if (end < start) return false;
    
    // Calculate days difference using UTC dates to avoid timezone issues
    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diffTime = endUTC - startUTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive
    
    // Only allow dates that result in 7 days or less
    return diffDays <= 7;
  };

  // Date filter function to only allow future dates (today and later)
  readonly futureDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of today
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); // Reset to start of selected date
    
    // Only allow dates that are today or in the future
    return selectedDate >= today;
  };

  // Computed values
  readonly filteredEntries: Signal<Entries> = computed(() => {
    let entries = ENTRIES;

    // Filter by type
    const typeFilter = this.filterForm?.get('entryType')?.value;
    if (typeFilter) {
      entries = entries.filter((entry: Entry) => entry.type === typeFilter);
    }

    // Filter by location
    const locationFilter = this.filterForm?.get('location')?.value;
    if (locationFilter) {
      entries = entries.filter((entry: Entry) => entry.location === locationFilter);
    }

    // Filter by search query
    const searchQuery = this.filterForm?.get('searchQuery')?.value;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter((entry: Entry) => 
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query)
      );
    }

    return entries;
  });

  readonly canSave: Signal<boolean> = computed(() => {
    const form = this.itineraryForm;
    if (!form) return false;

    const hasName = form.get('name')?.value?.trim();
    const hasStartDate = form.get('startDate')?.value;
    const hasEndDate = form.get('endDate')?.value;
    const hasThumbnail = this.selectedThumbnail();
    const hasEntries = this.getTotalEntriesCount() > 0;
    const hasValidDates = hasStartDate && hasEndDate && this.generatedDays().length > 0;

    return hasName && hasValidDates && hasThumbnail && hasEntries;
  });

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Initializes the main form and filter form.
   */
  ngOnInit(): void {
    this.#initForm();
    this.#initFilterForm();
  }

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   * Completes the destroy subject to clean up subscriptions.
   */
  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  /**
   * Gets available entries for a specific day, excluding already added ones.
   * @param {ItineraryDay} day - The day to get available entries for.
   * @returns {Entry[]} Array of available entries for the specified day.
   */
  getAvailableEntriesForDay(day: ItineraryDay): Entry[] {
    const dayEntries = this.getDayEntries(day);
    const dayEntryIds = dayEntries.map(e => e.id);
    
    // Get entries that are not already assigned to this day
    const availableEntries = this.filteredEntries().filter(entry => !dayEntryIds.includes(entry.id));
    
    // Apply additional filters for day-specific display
    return availableEntries.filter(entry => this.isEntryVisibleInFilters(entry));
  }

  /**
   * Checks if an entry is visible based on current filter settings.
   * @param {Entry} entry - The entry to check visibility for.
   * @returns {boolean} True if the entry should be visible, false otherwise.
   */
  isEntryVisibleInFilters(entry: Entry): boolean {
    // Check if entry matches current filters
    const typeFilter = this.filterForm?.get('entryType')?.value;
    const locationFilter = this.filterForm?.get('location')?.value;
    const searchQuery = this.filterForm?.get('searchQuery')?.value;
    
    // Type filter
    if (typeFilter && entry.type !== typeFilter) {
      return false;
    }
    
    // Location filter
    if (locationFilter && entry.location !== locationFilter) {
      return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = entry.title.toLowerCase().includes(query);
      const matchesDescription = entry.description?.toLowerCase().includes(query) || false;
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Checks if there are any active filters applied.
   * @returns {boolean} True if any filters are active, false otherwise.
   */
  hasActiveFilters(): boolean {
    const typeFilter = this.filterForm?.get('entryType')?.value;
    const locationFilter = this.filterForm?.get('location')?.value;
    const searchQuery = this.filterForm?.get('searchQuery')?.value;
    
    return !!(typeFilter || locationFilter || searchQuery);
  }

  /**
   * Checks if an entry can be added to a specific day.
   * @param {Entry} entry - The entry to check.
   * @param {ItineraryDay} day - The day to check against.
   * @returns {boolean} True if the entry can be added, false otherwise.
   */
  canAddEntryToDay(entry: Entry, day: ItineraryDay): boolean {
    const currentDayEntries = this.getDayEntries(day);
    if (currentDayEntries.length >= 5) {
      return false;
    }
    
    return !currentDayEntries.some(e => e.id === entry.id);
  }

  /**
   * Checks if an entry can be added to any day.
   * @param {Entry} entry - The entry to check.
   * @returns {boolean} True if the entry can be added to any day, false otherwise.
   */
  canAddEntryToAnyDay(entry: Entry): boolean {
    return this.generatedDays().some(day => this.canAddEntryToDay(entry, day));
  }

  /**
   * Gets the total count of entries across all days.
   * @returns {number} The total count of all entries.
   */
  getTotalEntriesCount(): number {
    let total = 0;
    this.selectedEntries().forEach(entries => {
      total += entries.length;
    });
    return total;
  }

  /**
   * Handles date range changes and generates days for the valid range.
   * Validates the date range and clears invalid day entries.
   */
  onDateRangeChange(): void {
    const start = this.itineraryForm.get('startDate')?.value;
    const end = this.itineraryForm.get('endDate')?.value;

    if (!start || !end) {
      this.generatedDays.set([]);
      this.selectedDateRange.set({ start: null, end: null });
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Normalize dates to midnight to avoid time-based issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      this.generatedDays.set([]);
      this.selectedDateRange.set({ start: null, end: null });
      // Set form error for invalid date range
      this.itineraryForm.get('endDate')?.setErrors({ invalidDateRange: true });
      return;
    }

    // Calculate days difference using UTC dates to avoid timezone issues
    const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = endUTC - startUTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive

    if (diffDays > 7) {
      this.generatedDays.set([]);
      this.selectedDateRange.set({ start: null, end: null });
      // Set form error for max days exceeded
      this.itineraryForm.get('endDate')?.setErrors({ maxDaysExceeded: true });
      return;
    }

    // If we get here, the date range is valid - clear any errors
    this.itineraryForm.get('endDate')?.setErrors(null);
    
    // Generate days for the valid date range
    const days = this.#itineraryService.generateDaysFromRange(startDate, endDate);
    this.generatedDays.set(days);
    this.selectedDateRange.set({ start: startDate, end: endDate });

    this.#clearInvalidDayEntries(days);
    
    // Trigger form validation to update error states
    this.itineraryForm.updateValueAndValidity();
  }

  /**
   * Handles thumbnail file selection and converts it to base64.
   * @param {Event} event - The file input change event.
   */
  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.selectedThumbnail.set(e.target?.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  }

  /**
   * Handles thumbnail URL input changes.
   * @param {Event} event - The input change event.
   */
  onThumbnailUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedThumbnail.set(input.value);
  }

  /**
   * Handles quick add dropdown changes for entries.
   * @param {Event} event - The select change event.
   * @param {Entry} entry - The entry to add.
   */
  onQuickAddChange(event: Event, entry: Entry): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;
    
    if (selectedValue) {
      const selectedDay = this.generatedDays().find(day => day.date.toISOString() === selectedValue);
      if (selectedDay) {
        this.addEntryToDay(entry, selectedDay);
        // Reset the select to default option
        select.value = '';
      }
    }
  }

  /**
   * Handles add to day dropdown changes.
   * @param {Event} event - The select change event.
   * @param {ItineraryDay} day - The day to add the entry to.
   */
  onAddToDayChange(event: Event, day: ItineraryDay): void {
    const select = event.target as HTMLSelectElement;
    const selectedEntryId = select.value;
    
    if (selectedEntryId) {
      const selectedEntry = this.filteredEntries().find(entry => entry.id === selectedEntryId);
      if (selectedEntry) {
        this.addEntryToDay(selectedEntry, day);
        // Reset the select to default option
        select.value = '';
      }
    }
  }

  /**
   * Adds an entry to a specific day if capacity allows.
   * @param {Entry} entry - The entry to add.
   * @param {ItineraryDay} day - The day to add the entry to.
   */
  addEntryToDay(entry: Entry, day: ItineraryDay): void {
    // Check if the day already has 5 entries
    const currentDayEntries = this.getDayEntries(day);
    if (currentDayEntries.length >= 5) {
      this.#snackBar.open('Maximum 5 entries per day allowed', 'Close', { duration: 3000 });
      return;
    }

    const dayKey = day.date.toISOString().split('T')[0];
    const current = this.selectedEntries();
    const dayEntries = current.get(dayKey) || [];
    
    if (dayEntries.some(e => e.id === entry.id)) {
      this.#snackBar.open('Entry already added to this day', 'Close', { duration: 3000 });
      return;
    }

    dayEntries.push(entry);
    current.set(dayKey, dayEntries);
    this.selectedEntries.set(new Map(current));
    
    // Provide success feedback
    this.#snackBar.open(
      `"${entry.title}" added to ${this.formatDate(day.date)}`, 
      'Close', 
      { duration: 2000 }
    );
  }

  /**
   * Removes an entry from a specific day.
   * @param {Entry} entry - The entry to remove.
   * @param {ItineraryDay} day - The day to remove the entry from.
   */
  removeEntryFromDay(entry: Entry, day: ItineraryDay): void {
    const dayKey = day.date.toISOString().split('T')[0];
    const current = this.selectedEntries();
    const dayEntries = current.get(dayKey) || [];
    
    const filtered = dayEntries.filter(e => e.id !== entry.id);
    if (filtered.length === 0) {
      current.delete(dayKey);
    } else {
      current.set(dayKey, filtered);
    }
    
    this.selectedEntries.set(new Map(current));
  }

  /**
   * Gets all entries for a specific day.
   * @param {ItineraryDay} day - The day to get entries for.
   * @returns {Entry[]} Array of entries for the specified day.
   */
  getDayEntries(day: ItineraryDay): Entry[] {
    const dayKey = day.date.toISOString().split('T')[0];
    return this.selectedEntries().get(dayKey) || [];
  }

  /**
   * Gets the remaining capacity for a specific day.
   * @param {ItineraryDay} day - The day to check capacity for.
   * @returns {number} The number of entries that can still be added to the day.
   */
  getRemainingCapacity(day: ItineraryDay): number {
    const currentDayEntries = this.getDayEntries(day);
    return Math.max(0, 5 - currentDayEntries.length);
  }

  /**
   * Saves the itinerary if all required fields are filled.
   * Creates the itinerary and closes the dialog on success.
   */
  onSave(): void {
    if (!this.canSave()) {
      this.#snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    try {
      const formValue = this.itineraryForm.value;
      const days = this.generatedDays().map(day => ({
        ...day,
        entries: this.getDayEntries(day)
      }));

      const itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formValue.name,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        thumbnailUrl: this.selectedThumbnail(),
        days
      };

      const saved = this.#itineraryService.createItinerary(itinerary);
      
      this.#snackBar.open('Itinerary created successfully!', 'Close', { duration: 3000 });
      this.#dialogRef.close(saved);
    } catch (error) {
      this.#snackBar.open('Error creating itinerary', 'Close', { duration: 3000 });
      console.error('Error creating itinerary:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cancels the itinerary creation and closes the dialog.
   */
  onCancel(): void {
    this.#dialogRef.close();
  }

  /**
   * Formats a date into a readable string format.
   * @param {Date} date - The date to format.
   * @returns {string} Formatted date string (e.g., "Mon, Jan 15").
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Returns the appropriate icon emoji based on the entry type.
   * @param {EntryType} type - The type of entry (activity, hotel, restaurant, etc.)
   * @returns {string} The emoji icon representing the entry type.
   */
  getEntryTypeIcon(type: EntryType): string {
    switch (type) {
      case EntryType.ACTIVITY: return '🎯';
      case EntryType.HOTEL: return '🏨';
      case EntryType.RESTAURANT: return '🍽️';
      default: return '📍';
    }
  }

  /**
   * Initializes the main itinerary form with validation.
   * Sets up date change listeners for validation.
   */
  #initForm(): void {
    this.itineraryForm = this.#fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]]
    }, { validators: this.#dateRangeValidator() });

    // Listen to date changes for validation
    this.itineraryForm.get('startDate')?.valueChanges.subscribe(() => {
      this.#validateDateRange();
    });
    
    this.itineraryForm.get('endDate')?.valueChanges.subscribe(() => {
      this.#validateDateRange();
    });
  }

  /**
   * Creates a custom validator for date range validation.
   * Ensures start date is before end date and range doesn't exceed 7 days.
   * @returns {ValidatorFn} The custom validator function.
   */
  #dateRangeValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const start = formGroup.get('startDate')?.value;
      const end = formGroup.get('endDate')?.value;

      if (!start || !end) {
        return null;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Normalize dates to midnight to avoid time-based issues
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (startDate > endDate) {
        return { invalidDateRange: true };
      }

      // Calculate days difference using UTC dates to avoid timezone issues
      const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const diffTime = endUTC - startUTC;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive

      if (diffDays > 7) {
        return { maxDaysExceeded: true };
      }

      return null;
    };
  }

  /**
   * Validates the current date range and sets appropriate form errors.
   * Called when date values change to provide real-time validation.
   */
  #validateDateRange(): void {
    const start = this.itineraryForm.get('startDate')?.value;
    const end = this.itineraryForm.get('endDate')?.value;

    if (!start || !end) {
      this.itineraryForm.setErrors({ ...this.itineraryForm.errors, invalidDateRange: null, maxDaysExceeded: null });
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Normalize dates to midnight to avoid time-based issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      this.itineraryForm.setErrors({ ...this.itineraryForm.errors, invalidDateRange: true });
      return;
    }

    // Calculate days difference using UTC dates to avoid timezone issues
    const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffTime = endUTC - startUTC;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive

    if (diffDays > 7) {
      this.itineraryForm.setErrors({ ...this.itineraryForm.errors, maxDaysExceeded: true });
      return;
    }

    this.itineraryForm.setErrors({ ...this.itineraryForm.errors, invalidDateRange: null, maxDaysExceeded: null });
  }

  /**
   * Initializes the filter form for entry filtering.
   */
  #initFilterForm(): void {
    this.filterForm = this.#fb.group({
      entryType: [''],
      location: [''],
      searchQuery: ['']
    });
  }

  /**
   * Clears invalid day entries when the date range changes.
   * Removes entries for days that no longer exist in the valid range.
   * @param {ItineraryDay[]} validDays - The array of valid days.
   */
  #clearInvalidDayEntries(validDays: ItineraryDay[]): void {
    const validDayKeys = validDays.map(day => day.date.toISOString().split('T')[0]);
    const current = this.selectedEntries();
    const updated = new Map<string, Entry[]>();
    
    // Only keep entries for days that still exist
    for (const [dayKey, entries] of current) {
      if (validDayKeys.includes(dayKey)) {
        updated.set(dayKey, entries);
      }
    }
    
    this.selectedEntries.set(updated);
  }
}
