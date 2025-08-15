import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'tnt-create-itinerary',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './create-itinerary.component.html',
  styleUrl: './create-itinerary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateItineraryComponent { }
