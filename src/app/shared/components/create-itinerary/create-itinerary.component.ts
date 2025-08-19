import { ChangeDetectionStrategy, Component, computed, signal, WritableSignal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Entry, ItineraryDraft } from '../../interface';
import { EntryType, Location } from '../../enums';
import { FavoritesService } from '../../services';
import { ItinerariesService } from '../../services';
import { CardComponent } from '../card/card.component';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'tnt-create-itinerary',
    imports: [
        CommonModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        ReactiveFormsModule,
        CardComponent,
        ButtonComponent
    ],
    templateUrl: './create-itinerary.component.html',
    styleUrl: './create-itinerary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateItineraryComponent {
    readonly #fb = inject(FormBuilder);
    readonly #favorites = inject(FavoritesService);
    readonly #itineraries = inject(ItinerariesService);
    readonly #dialogRef = inject(MatDialogRef<CreateItineraryComponent>);
    readonly MAX_TRIP_DAYS = 7;

    readonly EntryType = EntryType;
    readonly Location = Location;

    /**
     * Sets up reactive effects to keep form controls in sync with signals
     * and to initialize daily entries whenever the available dates change.
     */
    constructor() {
        // Sync form values with signals
        effect(() => {
            const startDate = this.startDate();
            const endDate = this.endDate();
            this.startDateControl?.setValue(startDate);
            this.endDateControl?.setValue(endDate);
        });

        // Initialize form when dates change
        effect(() => {
            const dates = this.availableDates();
            console.log('Available dates changed:', dates.length, 'dates');
            if (dates.length > 0) {
                // Clear existing entries
                this.dailyEntriesArray.clear();
                console.log('Cleared daily entries array');
                // Add entries for each date
                dates.forEach((date) => {
                    this.addDailyEntry(date);
                });
                console.log('Added daily entries, total count:', this.dailyEntriesArray.length);
            }
        });
    }
    readonly today: Date = (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        return date;
    })();

    startDate: WritableSignal<Date | null> = signal<Date | null>(null);
    endDate: WritableSignal<Date | null> = signal<Date | null>(null);
    thumbnailPreview: WritableSignal<string | null> = signal<string | null>(null);

    // Entry selection form
    readonly entrySelectionForm = this.#fb.group({
        itineraryName: ['', { validators: [Validators.required, Validators.minLength(3)] }],
        startDate: [null as Date | null, { validators: [Validators.required] }],
        endDate: [{ value: null as Date | null, disabled: true }, Validators.required],
        thumbnailImage: [null as File | null, { validators: [] }],
        dailyEntries: this.#fb.array([])
    });

    // All available entries
    readonly allEntries = computed(() => this.#favorites.entries());

    // Filtered entries based on selected category and location
    readonly filteredEntries = computed(() => {
        const entries = this.allEntries();
        const categoryFilter = this.activeCategoryFilter();
        const locationFilter = this.activeLocationFilter();

        let filtered = entries;

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter((entry) => entry.type === categoryFilter);
        }

        // Apply location filter
        if (locationFilter !== 'all') {
            filtered = filtered.filter((entry) => entry.location === locationFilter);
        }

        return filtered;
    });

    // Computed counts for entry types
    readonly activityCount = computed(() => this.allEntries().filter((entry) => entry.type === EntryType.ACTIVITY).length);
    readonly hotelCount = computed(() => this.allEntries().filter((entry) => entry.type === EntryType.HOTEL).length);
    readonly restaurantCount = computed(() => this.allEntries().filter((entry) => entry.type === EntryType.RESTAURANT).length);

    // Computed counts for locations
    readonly parisCount = computed(() => this.allEntries().filter((entry) => entry.location === Location.PARIS).length);
    readonly londonCount = computed(() => this.allEntries().filter((entry) => entry.location === Location.LONDON).length);
    readonly spainCount = computed(() => this.allEntries().filter((entry) => entry.location === Location.SPAIN).length);

    // Available dates for selection
    readonly availableDates = computed(() => {
        const start = this.startDate();
        const end = this.endDate();
        if (!start || !end) return [];

        const dates: Date[] = [];
        const current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        console.log('Available dates calculation:', {
            start: start?.toDateString(),
            end: end?.toDateString(),
            count: dates.length,
            tripDays: this.tripDays()
        });

        return dates;
    });

    // Maximum entries per day
    readonly MAX_ENTRIES_PER_DAY = 5;

    // Currently active date tab
    readonly activeDateTab = signal<number>(0);

    // Currently active category filter
    readonly activeCategoryFilter = signal<EntryType | 'all'>('all');

    // Currently active location filter
    readonly activeLocationFilter = signal<Location | 'all'>('all');

    // Form control getters
    /** Gets the `itineraryName` form control. */
    get itineraryNameControl() {
        return this.entrySelectionForm.get('itineraryName');
    }

    /** Gets the `startDate` form control. */
    get startDateControl() {
        return this.entrySelectionForm.get('startDate');
    }

    /** Gets the `endDate` form control. */
    get endDateControl() {
        return this.entrySelectionForm.get('endDate');
    }

    /** Gets the `thumbnailImage` form control. */
    get thumbnailImageControl() {
        return this.entrySelectionForm.get('thumbnailImage');
    }

    endMaxDate = computed<Date | null>(() => {
        const selectedStartDate = this.startDate();
        if (!selectedStartDate) {
            return null;
        }
        const maxDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate());
        // Subtract 1 to ensure maximum trip is exactly MAX_TRIP_DAYS days
        // e.g., if MAX_TRIP_DAYS is 7, then Aug 19 to Aug 25 = 7 days
        maxDate.setDate(maxDate.getDate() + this.MAX_TRIP_DAYS - 1);

        return maxDate;
    });

    tripDays = computed<number | ''>(() => {
        const start = this.startDate();
        const end = this.endDate();
        if (!start || !end) {
            return '';
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
        const diffDays = Math.floor((endUtc - startUtc) / msPerDay);

        // Add 1 to include both start and end dates (inclusive)
        return diffDays >= 0 ? diffDays + 1 : 0;
    });

    /**
     * Handles updates to the trip start date, enforcing minimum constraints,
     * toggling the end date control, and clamping the end date within bounds.
     * @param date The selected start date or null.
     */
    onStartDateChange(date: Date | null): void {
        // Clamp to today if a past date somehow slips through
        if (date && date < this.today) {
            date = this.today;
        }
        this.startDate.set(date);
        this.startDateControl?.setValue(date);

        // Handle end date control disabled state
        if (!date) {
            this.endDate.set(null);
            this.endDateControl?.setValue(null);
            this.endDateControl?.disable();

            return;
        } else {
            this.endDateControl?.enable();
        }

        const maxAllowedEndDate = this.endMaxDate();
        const currentEndDate = this.endDate();
        // Ensure end date is within [startDate, endMaxDate]
        if (maxAllowedEndDate && currentEndDate && currentEndDate > maxAllowedEndDate) {
            this.endDate.set(maxAllowedEndDate);
            this.endDateControl?.setValue(maxAllowedEndDate);
        } else if (date && currentEndDate && currentEndDate < date) {
            this.endDate.set(date);
            this.endDateControl?.setValue(date);
        }
    }

    /**
     * Handles thumbnail image file selection and prepares a preview.
     * @param event The input change event from the file picker.
     */
    onImageFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file && file.type.startsWith('image/')) {
            this.thumbnailImageControl?.setValue(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                this.thumbnailPreview.set(result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Entry selection methods
    /** Gets the `dailyEntries` FormArray that holds per-day selections. */
    get dailyEntriesArray(): FormArray {
        return this.entrySelectionForm.get('dailyEntries') as FormArray;
    }

    /**
     * Adds a new daily entry group for the given date if it doesn't already exist.
     * @param date The date to create a daily entry group for.
     */
    addDailyEntry(date: Date): void {
        // Prevent duplicate date groups by checking if a control with this exact date already exists
        const exists = this.dailyEntriesArray.controls.some((control) => {
            const controlDate = control.get('date')?.value as Date | null;

            return controlDate && controlDate.getTime() === date.getTime();
        });

        if (exists) {
            return;
        }

        const dailyEntry = this.#fb.group({
            date: [date],
            selectedEntries: this.#fb.array([])
        });
        this.dailyEntriesArray.push(dailyEntry);
    }

    /**
     * Removes the daily entry group at the specified index.
     * @param index The zero-based index of the daily entry to remove.
     */
    removeDailyEntry(index: number): void {
        this.dailyEntriesArray.removeAt(index);
    }

    /**
     * Returns the selected `Entry` objects for the specified date.
     * @param date The date for which to retrieve selected entries.
     * @returns The list of selected entries for the date.
     */
    getSelectedEntriesForDate(date: Date): Entry[] {
        // Safety check: ensure the FormArray exists and has controls
        if (!this.dailyEntriesArray || this.dailyEntriesArray.length === 0) {
            return [];
        }

        const dailyEntry = this.dailyEntriesArray.controls.find((control) => {
            const controlDate = control.get('date')?.value;

            return controlDate && controlDate.getTime() === date.getTime();
        });

        if (!dailyEntry) return [];

        const selectedEntryIds = dailyEntry.get('selectedEntries')?.value || [];

        return this.allEntries().filter((entry) => selectedEntryIds.includes(entry.id));
    }

    /**
     * Toggles selection of an entry for the given date, enforcing the maximum
     * entries per day constraint.
     * @param date The date being modified.
     * @param entryId The ID of the entry being toggled.
     * @param event The change event from the checkbox.
     */
    onEntrySelectionChange(date: Date, entryId: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const isSelected = target.checked;

        console.log('Entry selection change:', { date: date.toDateString(), entryId, isSelected });

        // Safety check: ensure the FormArray exists and has controls
        if (!this.dailyEntriesArray || this.dailyEntriesArray.length === 0) {
            console.log('No daily entries array found');

            return;
        }

        const dailyEntry = this.dailyEntriesArray.controls.find((control) => {
            const controlDate = control.get('date')?.value;

            return controlDate && controlDate.getTime() === date.getTime();
        });

        if (!dailyEntry) {
            console.log('No daily entry found for date:', date.toDateString());

            return;
        }

        const selectedEntriesControl = dailyEntry.get('selectedEntries') as FormArray;

        // Ensure we have a valid FormArray
        if (!selectedEntriesControl) {
            console.log('No selected entries control found');

            return;
        }

        const currentSelection = selectedEntriesControl.value || [];
        console.log('Current selection before change:', currentSelection);

        if (isSelected) {
            // Check if entry is already selected to prevent duplicates
            if (currentSelection.includes(entryId)) {
                return;
            }

            if (currentSelection.length < this.MAX_ENTRIES_PER_DAY) {
                // Clear the array and add the new selection
                selectedEntriesControl.clear();
                const newSelection = [...currentSelection, entryId];
                newSelection.forEach((id: string) => {
                    selectedEntriesControl.push(this.#fb.control(id));
                });
            }
        } else {
            // Clear the array and add the filtered selection
            selectedEntriesControl.clear();
            const newSelection = currentSelection.filter((id: string) => id !== entryId);
            newSelection.forEach((id: string) => {
                selectedEntriesControl.push(this.#fb.control(id));
            });
        }

        console.log('Final selection after change:', selectedEntriesControl.value);
    }

    /**
     * Checks whether the specified entry is selected for the given date.
     * @param date The date to check against.
     * @param entryId The ID of the entry.
     * @returns True if the entry is selected for the date.
     */
    isEntrySelected(date: Date, entryId: string): boolean {
        // Safety check: ensure the FormArray exists and has controls
        if (!this.dailyEntriesArray || this.dailyEntriesArray.length === 0) {
            return false;
        }

        const dailyEntry = this.dailyEntriesArray.controls.find((control) => {
            const controlDate = control.get('date')?.value;

            return controlDate && controlDate.getTime() === date.getTime();
        });

        if (!dailyEntry) return false;

        const selectedEntryIds = dailyEntry.get('selectedEntries')?.value || [];

        return selectedEntryIds.includes(entryId);
    }

    /**
     * Determines whether the entry checkbox should be disabled based on
     * the current selection count and max-per-day limit.
     * @param date The date being modified.
     * @param entryId The ID of the entry.
     */
    isEntryDisabled(date: Date, entryId: string): boolean {
        return !this.isEntrySelected(date, entryId) && this.getSelectedEntriesCount(date) >= this.MAX_ENTRIES_PER_DAY;
    }

    /**
     * Gets the number of selected entries for the given date.
     * @param date The date to count selections for.
     */
    getSelectedEntriesCount(date: Date): number {
        // Safety check: ensure the FormArray exists and has controls
        if (!this.dailyEntriesArray || this.dailyEntriesArray.length === 0) {
            return 0;
        }

        const dailyEntry = this.dailyEntriesArray.controls.find((control) => {
            const controlDate = control.get('date')?.value;

            return controlDate && controlDate.getTime() === date.getTime();
        });

        if (!dailyEntry) return 0;

        const selectedEntryIds = dailyEntry.get('selectedEntries')?.value || [];

        return selectedEntryIds.length;
    }

    /**
     * Formats a date for display in the UI (e.g., Mon, Jan 1).
     * @param date The date to format.
     * @returns A localized, short display string.
     */
    formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Activates the date tab at the given index and resets the category and location filters.
     * @param index The zero-based tab index to activate.
     */
    setActiveDateTab(index: number): void {
        this.activeDateTab.set(index);
        // Reset category and location filters when switching dates
        this.activeCategoryFilter.set('all');
        this.activeLocationFilter.set('all');
    }

    /**
     * Sets the active category filter for the currently active date.
     * @param filter The category filter to apply.
     */
    setActiveCategoryFilter(filter: EntryType | 'all'): void {
        this.activeCategoryFilter.set(filter);
    }

    /**
     * Sets the active location filter for the currently active date.
     * @param filter The location filter to apply.
     */
    setActiveLocationFilter(filter: Location | 'all'): void {
        this.activeLocationFilter.set(filter);
    }

    // Handlers for native select changes
    onCategorySelectChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as 'all' | EntryType;
        this.setActiveCategoryFilter(value === 'all' ? 'all' : (value as EntryType));
    }

    onLocationSelectChange(event: Event): void {
        const value = (event.target as HTMLSelectElement).value as 'all' | Location;
        this.setActiveLocationFilter(value === 'all' ? 'all' : (value as Location));
    }

    /**
     * Handles updates to the trip end date.
     * @param date The selected end date or null.
     */
    onEndDateChange(date: Date | null): void {
        this.endDate.set(date);
        this.endDateControl?.setValue(date);
    }

    /**
     * Validates and saves the itinerary draft to local storage via the service.
     */
    onSubmit(): void {
        if (this.entrySelectionForm.valid) {
            const draft: ItineraryDraft = {
                itineraryName: this.itineraryNameControl?.value ?? '',
                startDate: this.startDate(),
                endDate: this.endDate(),
                days: typeof this.tripDays() === 'number' ? (this.tripDays() as number) : 0,
                thumbnailDataUrl: this.thumbnailPreview(),
                dailyEntries: this.dailyEntriesArray.controls.map((control) => ({
                    date: control.get('date')?.value ?? null,
                    selectedEntryIds: (control.get('selectedEntries')?.value ?? []) as string[]
                }))
            };

            const saved = this.#itineraries.save(draft);
            console.log('Itinerary saved to localStorage:', saved);
            this.#dialogRef.close(saved);
        }
    }

    /**
     * Returns true when for every available date the user has selected
     * at least one entry. Used to enable the submit button.
     */
    hasAtLeastOneEntryPerDate(): boolean {
        const dates = this.availableDates();
        if (!dates || dates.length === 0) {
            return false;
        }

        return dates.every((date) => this.getSelectedEntriesForDate(date).length > 0);
    }
}
