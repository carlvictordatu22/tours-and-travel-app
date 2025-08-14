import { Routes } from '@angular/router';
import { ActivitiesComponent } from './features/activities';

export const routes: Routes = [
    { path: '', component: ActivitiesComponent, pathMatch: 'full' },
    {
        path: 'hotels',
        loadComponent: () => import('./features/hotels/hotels.component')
            .then(mod => mod.HotelsComponent)
    },
    {
        path: 'restaurants',
        loadComponent: () => import('./features/restaurants/restaurants.component')
            .then(mod => mod.RestaurantsComponent)
    },
    {
        path: 'ai-search',
        loadComponent: () => import('./features/ai-search/ai-search.component')
            .then(mod => mod.AISearchComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
            .then(mod => mod.ProfileComponent)
    },
];