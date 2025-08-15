import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-ai-search',
  imports: [CommonModule],
  templateUrl: './ai-search.component.html',
  styleUrl: './ai-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AISearchComponent { }
