import { ChangeDetectionStrategy, Component, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent } from '../../shared';

@Component({
  selector: 'tnt-activities',
  imports: [CommonModule, CardComponent, PaginationComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent {
  readonly isLoading = signal(false);
  readonly activities: Signal<Entries> = computed(() => ENTRIES.filter((entry: Entry) => entry.type === EntryType.ACTIVITY).slice(0, 9));
}
