import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../shared/services';

@Component({
  selector: 'tnt-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  // Private dependencies
  readonly #favorites = inject(FavoritesService);

  readonly favoritesCount = this.#favorites.favoritesCount;
}
