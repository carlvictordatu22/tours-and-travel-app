import { ChangeDetectionStrategy, Component, EventEmitter, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tnt-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly pageChange = output<number>();

  /**
   * Generates an array of page numbers to display in the pagination
   * Includes ellipsis (-1 and -2) to represent gaps between page ranges
   * @returns Array of page numbers and ellipsis indicators
   */
  get pages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    
    // Add ellipsis if there's a gap
    if (start > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if there's a gap
    if (end < total - 1) {
      pages.push(-2); // -2 represents ellipsis
    }
    
    // Always show last page if there's more than one page
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  }

  /**
   * Emits a page change event when a page is selected
   * @param page - The page number to navigate to
   */
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
