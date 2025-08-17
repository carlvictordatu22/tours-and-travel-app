import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-skeleton',
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  readonly type = input<'card' | 'text' | 'circle' | 'pagination' | 'navbar'>('card');
  readonly width = input<string>('100%');
  readonly height = input<string>('100%');
  readonly lines = input<number>(1);
} 