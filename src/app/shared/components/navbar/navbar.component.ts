import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateItineraryComponent } from '../create-itinerary';
import { MODAL_PANEL_CLASS } from '../../constants';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '../../enums';
import { LocationFilterService } from '../../services';

@Component({
  selector: 'tnt-navbar',
  imports: [CommonModule, RouterLink, MatDialogModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly #dialog = inject(MatDialog);
  readonly #router = inject(Router);
  readonly #locationFilterService = inject(LocationFilterService);

  searchQuery = signal('');
  isSearchFocused = signal(false);
  readonly options: Location[] = [Location.PARIS, Location.LONDON, Location.SPAIN];

  // Get the current location filter state
  readonly currentLocationFilter = this.#locationFilterService.locationFilter;

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();

    if (!query) {
      return [];
    }

    return this.options.filter(item =>
      item.toLowerCase().includes(query)
    );
  });

  isOverlayDropdownShown = computed(() => this.filteredItems().length > 0 && this.isSearchFocused());

  /**
   * Opens the create itinerary dialog
   */
  openCreateItineraryDialog(): void {
    this.#dialog.open(
      CreateItineraryComponent,
      {
        width: '95vw',
        maxWidth: '1200px',
        height: '95vh',
        maxHeight: '900px',
        panelClass: MODAL_PANEL_CLASS,
        hasBackdrop: true,
        disableClose: false,
      }
    );
  }

  /**
   * Handles search input focus event
   */
  onSearchFocus(): void {
    this.isSearchFocused.set(true);
  }

  /**
   * Handles search input blur event
   */
  onSearchBlur(): void {
    this.isSearchFocused.set(false);
  }

  /**
   * Handles location selection from dropdown
   * @param location - The selected location string
   */
  onChooseLocation(location: string): void {
    this.searchQuery.set(location);
    this.onSearchBlur();
    
    // Apply the location filter globally
    this.#locationFilterService.setLocationFilter(location as Location);
    
    // Navigate to the current route to refresh the view with the new filter
    this.#refreshCurrentRoute();
  }

  /**
   * Clears the current location filter
   */
  clearLocationFilter(): void {
    this.searchQuery.set('');
    this.#locationFilterService.clearLocationFilter();
    this.#refreshCurrentRoute();
  }

  /**
   * Check if a route is active, ignoring query parameters
   * This ensures the navbar shows the correct active state even with pagination
   * @param routePath - The route path to check
   * @returns True if the route is active
   */
  isRouteActive(routePath: string): boolean {
    const currentUrl = this.#router.url;
    
    // For root route, check if we're exactly on '/' or on '/activities' (which redirects to root)
    if (routePath === '/') {
      return currentUrl === '/' || currentUrl.startsWith('/?');
    }
    
    // For other routes, check if the path starts with the route (ignoring query params)
    return currentUrl.startsWith(routePath);
  }

  /**
   * Refreshes the current route to apply location filter changes
   */
  #refreshCurrentRoute(): void {
    // Get current route
    const currentUrl = this.#router.url;
    
    // If we're on a main page, refresh it to apply the filter
    if (currentUrl === '/' || currentUrl === '/hotels' || currentUrl === '/restaurants') {
      // Navigate to the same route to trigger a refresh
      this.#router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.#router.navigate([currentUrl]);
      });
    }
  }
}
