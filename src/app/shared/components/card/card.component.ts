import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EntryType } from '../../enums';

@Component({
  selector: 'tnt-card',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  imageUrl = input<string>('');
  title = input<string>('');
  description = input<string>('');
  isFavorite = input<boolean>(false);
  isFavoriteChange = output<boolean>();
  type = input<EntryType | null>(null);
  priority = input<boolean>(false);

  /**
   * Toggle favorite state and emit the new value via `isFavoriteChange`.
   */
  toggleFavorite(): void {
    this.isFavoriteChange.emit(!this.isFavorite());
  }
}
