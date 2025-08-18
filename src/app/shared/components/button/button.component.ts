import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  readonly primary = input<boolean>(false);
  readonly accent = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly blockSm = input<boolean>(false);
  readonly block = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}


