import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-hotels',
  imports: [CommonModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent { }
