import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  @Input() primary: boolean = false;
  @Input() accent: boolean = false;
  @Input() disabled: boolean = false;
  @Input() blockSm: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}


