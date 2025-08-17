import { Routes } from '@angular/router';
import { ActivitiesComponent } from './features/activities';

export const routes: Routes = [
    {
        path: '', component: ActivitiesComponent, pathMatch: 'full', data: {
            title: 'Activities',
            ogTitle: 'Activities List',
            ogDescription: 'Check out our amazing list of activities!',
            ogImage: ''
        },
    },
    {
        path: 'hotels',
        data: {
            title: 'Hotels',
            ogTitle: 'Hotel List',
            ogDescription: 'Check out our amazing list of hotels!',
            ogImage: ''
        },
        loadComponent: () => import('./features/hotels/hotels.component')
            .then(mod => mod.HotelsComponent)
    },
    {
        path: 'location-search',
        data: {
            title: 'Location Search',
            ogTitle: 'Find Locations',
            ogDescription: 'Search and discover destinations and points of interest.',
            ogImage: ''
        },
        loadComponent: () => import('./features/location-search/location-search.component')
            .then(mod => mod.LocationSearchComponent)
    },
    {
        path: 'location-search/:location',
        data: {
            title: 'Location Search',
            ogTitle: 'Find Locations',
            ogDescription: 'Search and discover destinations and points of interest.',
            ogImage: ''
        },
        loadComponent: () => import('./features/location-search/location-search.component')
            .then(mod => mod.LocationSearchComponent)
    },
    {
        path: 'restaurants',
        data: {
            title: 'Restaurants',
            ogTitle: 'Restaurants List',
            ogDescription: 'Check out our amazing list of restaurants!',
            ogImage: ''
        },
        loadComponent: () => import('./features/restaurants/restaurants.component')
            .then(mod => mod.RestaurantsComponent)
    },
    {
        path: 'ai-search',
        data: {
            title: 'AI Search',
            ogTitle: 'Search Relevant Entries',
            ogDescription: 'Search for any keywords and we will show relevant entries.',
            ogImage: ''
        },
        loadComponent: () => import('./features/ai-search/ai-search.component')
            .then(mod => mod.AISearchComponent)
    },
    {
        path: 'profile',
        data: {
            title: 'Profile',
            ogTitle: 'User Profile',
            ogDescription: 'Personal space for user to see account related items.',
            ogImage: ''
        },
        loadComponent: () => import('./features/profile/profile.component')
            .then(mod => mod.ProfileComponent)
    },
];