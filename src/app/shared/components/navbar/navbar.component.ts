import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

  searchQuery = signal('');
  isSearchFocused = signal(false);
  readonly options: string[] = ['Paris', 'London', 'Spain'];

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();

    if (!query) {
      return [];
    }

    return this.options.filter(item =>
      item.toLowerCase().includes(query)
    );
  });

  isOverlayDropdownShown = computed(() => this.filteredItems().length > 0 && this.isSearchFocused());

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

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
  }

  onSearchBlur(): void {
    this.isSearchFocused.set(false);
  }

  onChooseLocation(location: string): void {
    this.searchQuery.set(location);
    this.onSearchBlur();
  }
}
