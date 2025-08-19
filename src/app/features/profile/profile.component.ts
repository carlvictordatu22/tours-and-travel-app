import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService, ItinerariesService } from '../../shared/services';

@Component({
    selector: 'tnt-profile',
    imports: [CommonModule, RouterModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
    readonly #favorites = inject(FavoritesService);
    readonly #itineraries = inject(ItinerariesService);

    readonly favoritesCount = this.#favorites.favoritesCount;
    readonly itinerariesCount = signal<number>(this.#itineraries.list().length);
}
