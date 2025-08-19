import { ChangeDetectionStrategy, Component, computed, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'tnt-create-itinerary',
    imports: [CommonModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatFormFieldModule],
    templateUrl: './create-itinerary.component.html',
    styleUrl: './create-itinerary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateItineraryComponent {
    readonly MAX_TRIP_DAYS = 7;
    readonly today: Date = (() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    })();

    startDate: WritableSignal<Date | null> = signal<Date | null>(null);
    endDate: WritableSignal<Date | null> = signal<Date | null>(null);

    endMaxDate = computed<Date | null>(() => {
        const selectedStartDate = this.startDate();
        if (!selectedStartDate) {
            return null;
        }
        const maxDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate());
        maxDate.setDate(maxDate.getDate() + this.MAX_TRIP_DAYS);
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
        return diffDays > 0 ? diffDays : 0;
    });

    onStartDateChange(date: Date | null): void {
        // Clamp to today if a past date somehow slips through
        if (date && date < this.today) {
            date = this.today;
        }
        this.startDate.set(date);
        // If start date cleared, also clear end date
        if (!date) {
            this.endDate.set(null);
            return;
        }
        const maxAllowedEndDate = this.endMaxDate();
        const currentEndDate = this.endDate();
        // Ensure end date is within [startDate, endMaxDate]
        if (maxAllowedEndDate && currentEndDate && currentEndDate > maxAllowedEndDate) {
            this.endDate.set(maxAllowedEndDate);
        } else if (date && currentEndDate && currentEndDate < date) {
            this.endDate.set(date);
        }
    }
}
