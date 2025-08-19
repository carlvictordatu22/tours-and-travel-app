import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tnt-empty-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './empty-card.component.html',
    styleUrl: './empty-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyCardComponent {}
