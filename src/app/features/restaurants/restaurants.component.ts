import { ChangeDetectionStrategy, Component, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent } from '../../shared';

@Component({
  selector: 'tnt-restaurants',
  imports: [CommonModule, CardComponent, PaginationComponent],
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestaurantsComponent {
  readonly restaurants: Signal<Entries> = computed(() => ENTRIES.filter((entry: Entry) => entry.type === EntryType.RESTAURANT).slice(0, 9));
}
