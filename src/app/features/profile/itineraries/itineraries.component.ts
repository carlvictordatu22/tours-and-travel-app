import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tnt-profile-itineraries',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './itineraries.component.html',
    styleUrls: ['./itineraries.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileItinerariesComponent {}
