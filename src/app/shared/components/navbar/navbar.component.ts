import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateItineraryComponent } from '../create-itinerary';
import { MODAL_PANEL_CLASS, MODAL_WIDTH } from '../../constants';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatDialogModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly #dialog = inject(MatDialog);

  readonly options: string[] = ['Paris', 'London', 'Spain'];
  searchQuery = signal('');
  isSearchBlur = signal(false);

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();

    if (!query) {
      return this.options;
    }

    return this.options.filter(item =>
      item.toLowerCase().includes(query)
    );
  });

  isOverlayDropdownShown = computed(() => !!this.filteredItems().length && !this.isSearchBlur());

  constructor() {
    effect(() => {
      console.log('filteredItems', this.filteredItems())
      console.log('isOverlayDropdownShown', this.isOverlayDropdownShown())
    })
  }

  openCreateItineraryDialog(): void {
    this.#dialog.open(
      CreateItineraryComponent,
      {
        width: MODAL_WIDTH,
        panelClass: MODAL_PANEL_CLASS,
        hasBackdrop: true,
      }
    );
  }


  onSearchBlur(): void {
    this.isSearchBlur.set(true);
  }
}
