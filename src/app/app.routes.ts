import { Routes } from '@angular/router';
import { ActivitiesComponent } from './features/activities';

export const routes: Routes = [
    {
        path: '', 
        component: ActivitiesComponent, 
        pathMatch: 'full', 
        data: {
            title: 'HiPTraveler - Discover Amazing Activities & Experiences',
            ogTitle: 'HiPTraveler - Your Gateway to Unforgettable Travel Experiences',
            ogDescription: 'Explore curated activities, adventures, and experiences worldwide. Find the best things to do in your destination with HiPTraveler.',
            ogImage: '/assets/images/activity.png'
        },
    },
    {
        path: 'activities',
        data: {
            title: 'Activities & Experiences - HiPTraveler',
            ogTitle: 'Discover Amazing Activities & Experiences Worldwide',
            ogDescription: 'Browse through our curated collection of activities, adventures, tours, and experiences. Find the perfect activity for your next trip.',
            ogImage: '/assets/images/activity.png'
        },
        loadComponent: () => import('./features/activities/activities.component')
            .then(mod => mod.ActivitiesComponent)
    },
    {
        path: 'activities/:id',
        data: {
            title: 'Activity Details - HiPTraveler',
            ogTitle: 'Activity Details & Information',
            ogDescription: 'Get detailed information about this amazing activity. View photos, reviews, pricing, and book your next adventure.',
            ogImage: '/assets/images/activity.png'
        },
        loadComponent: () => import('./features/activities/activity-detail.component')
            .then(mod => mod.ActivityDetailComponent)
    },
    {
        path: 'hotels',
        data: {
            title: 'Hotels & Accommodations - HiPTraveler',
            ogTitle: 'Find Your Perfect Hotel & Accommodation',
            ogDescription: 'Discover handpicked hotels, resorts, and accommodations worldwide. From luxury to budget-friendly options for every traveler.',
            ogImage: '/assets/images/hotel.png'
        },
        loadComponent: () => import('./features/hotels/hotels.component')
            .then(mod => mod.HotelsComponent)
    },
    {
        path: 'hotels/:id',
        data: {
            title: 'Hotel Details - HiPTraveler',
            ogTitle: 'Hotel Details & Booking Information',
            ogDescription: 'Explore this hotel in detail. View amenities, photos, reviews, and secure the best rates for your stay.',
            ogImage: '/assets/images/hotel.png'
        },
        loadComponent: () => import('./features/hotels/hotel-detail.component')
            .then(mod => mod.HotelDetailComponent)
    },
    {
        path: 'restaurants',
        data: {
            title: 'Restaurants & Dining - HiPTraveler',
            ogTitle: 'Discover Amazing Restaurants & Culinary Experiences',
            ogDescription: 'Explore top-rated restaurants, cafes, and dining experiences. From local cuisine to international flavors, find your perfect meal.',
            ogImage: '/assets/images/restaurant.png'
        },
        loadComponent: () => import('./features/restaurants/restaurants.component')
            .then(mod => mod.RestaurantsComponent)
    },
    {
        path: 'restaurants/:id',
        data: {
            title: 'Restaurant Details - HiPTraveler',
            ogTitle: 'Restaurant Details & Menu Information',
            ogDescription: 'Learn more about this restaurant. View the menu, photos, reviews, and make reservations for an unforgettable dining experience.',
            ogImage: '/assets/images/restaurant.png'
        },
        loadComponent: () => import('./features/restaurants/restaurant-detail.component')
            .then(mod => mod.RestaurantDetailComponent)
    },
    {
        path: 'ai-search',
        data: {
            title: 'AI-Powered Travel Search - HiPTraveler',
            ogTitle: 'Smart AI Travel Search & Recommendations',
            ogDescription: 'Use our advanced AI to search for activities, hotels, and restaurants. Get personalized recommendations based on your preferences and travel style.',
            ogImage: '/assets/images/ai-search.png'
        },
        loadComponent: () => import('./features/ai-search/ai-search.component')
            .then(mod => mod.AISearchComponent)
    },
    {
        path: 'profile',
        data: {
            title: 'My Travel Profile - HiPTraveler',
            ogTitle: 'Personal Travel Profile & Favorites',
            ogDescription: 'Access your personal travel profile, view saved favorites, manage itineraries, and track your travel preferences.',
            ogImage: '/assets/images/profile.png'
        },
        loadComponent: () => import('./features/profile/profile.component')
            .then(mod => mod.ProfileComponent)
    },
];