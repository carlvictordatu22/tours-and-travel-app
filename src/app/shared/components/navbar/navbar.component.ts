import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateItineraryComponent } from '../create-itinerary';
import { MODAL_PANEL_CLASS, MODAL_WIDTH } from '../../constants';

@Component({
  selector: 'tnt-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatDialogModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly #dialog = inject(MatDialog);

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
}
