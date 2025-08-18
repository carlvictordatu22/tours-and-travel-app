import { Routes } from '@angular/router';
import { ActivitiesComponent } from './features/activities';

export const routes: Routes = [
    {
        path: '', component: ActivitiesComponent, pathMatch: 'full', data: {
            title: 'Activities & Experiences',
            ogTitle: 'Discover Activities & Experiences',
            ogDescription: 'Explore curated activities, tours, and experiences tailored to your destination.',
            ogImage: 'assets/images/activity.png'
        },
    },
    {
        path: 'hotels',
        data: {
            title: 'Hotels & Stays',
            ogTitle: 'Top Hotels & Stays',
            ogDescription: 'Find and compare top-rated hotels, resorts, and unique stays near your destination.',
            ogImage: 'assets/images/hotel.png'
        },
        loadComponent: () => import('./features/hotels/hotels.component')
            .then(mod => mod.HotelsComponent)
    },
    {
        path: 'location-search',
        data: {
            title: 'Search by Location',
            ogTitle: 'Search Destinations & Points of Interest',
            ogDescription: 'Search destinations, neighborhoods, landmarks, and points of interest to plan your trip.',
            ogImage: 'assets/images/map.png'
        },
        loadComponent: () => import('./features/location-search/location-search.component')
            .then(mod => mod.LocationSearchComponent)
    },
    {
        path: 'location-search/:location',
        data: {
            title: 'Search by Location',
            ogTitle: 'Search Destinations & Points of Interest',
            ogDescription: 'Search destinations, neighborhoods, landmarks, and points of interest to plan your trip.',
            ogImage: 'assets/images/map.png'
        },
        loadComponent: () => import('./features/location-search/location-search.component')
            .then(mod => mod.LocationSearchComponent)
    },
    {
        path: 'restaurants',
        data: {
            title: 'Restaurants & Dining',
            ogTitle: 'Best Restaurants & Dining',
            ogDescription: 'Discover popular restaurants, cafes, and local favorites wherever you travel.',
            ogImage: 'assets/images/restaurant.png'
        },
        loadComponent: () => import('./features/restaurants/restaurants.component')
            .then(mod => mod.RestaurantsComponent)
    },
    {
        path: 'ai-search',
        data: {
            title: 'AI Travel Search',
            ogTitle: 'AI-Powered Travel Search',
            ogDescription: 'Ask anything—our AI finds relevant activities, hotels, restaurants, and more.',
            ogImage: 'assets/images/ai-search.png'
        },
        loadComponent: () => import('./features/ai-search/ai-search.component')
            .then(mod => mod.AISearchComponent)
    },
    {
        path: 'profile',
        data: {
            title: 'Your Profile',
            ogTitle: 'Traveler Profile',
            ogDescription: 'Manage your favorites, itineraries, and account settings in one place.',
            ogImage: 'assets/images/profile.png'
        },
        loadComponent: () => import('./features/profile/profile.component')
            .then(mod => mod.ProfileComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'favorites' },
            { path: 'favorites', data: {
                title: 'My Favorites',
                ogTitle: 'Favorite Places & Experiences',
                ogDescription: 'Browse and manage your saved activities, hotels, and restaurants in one place.',
                ogImage: ''
            }, loadComponent: () => import('./features/profile/favorites/favorites.component').then(m => m.ProfileFavoritesComponent) },
            { path: 'itineraries', data: {
                title: 'My Itineraries',
                ogTitle: 'Planned Trips & Itineraries',
                ogDescription: 'Create, view, and organize your travel plans and day-by-day itineraries.',
                ogImage: ''
            }, loadComponent: () => import('./features/profile/itineraries/itineraries.component').then(m => m.ProfileItinerariesComponent) },
        ]
    },
];