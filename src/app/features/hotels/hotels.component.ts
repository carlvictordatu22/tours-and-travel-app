import { ChangeDetectionStrategy, Component, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent } from '../../shared';

@Component({
  selector: 'tnt-hotels',
  imports: [CommonModule, CardComponent, PaginationComponent],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent {
  readonly hotels: Signal<Entries> = computed(() => ENTRIES.filter((entry: Entry) => entry.type === EntryType.HOTEL).slice(0, 9));
}
