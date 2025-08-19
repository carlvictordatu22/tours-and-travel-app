import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'tnt-pagination',
    imports: [CommonModule],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
    readonly total = input.required<number>();
    readonly pageSize = input<number>(12);
    readonly page = model<number>(1);

    readonly totalPages = computed(() => {
        const items = this.total();
        const size = Math.max(1, this.pageSize());
        return Math.max(1, Math.ceil(items / size));
    });

    readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

    /**
     * Compact list of pages with ellipses for large page counts.
     * Strategy:
     * - If total pages <= 7, show all pages
     * - If near the start, show first 5, ellipsis, last
     * - If near the end, show first, ellipsis, last 5
     * - Otherwise, show first, ellipsis, current-1..current+1, ellipsis, last
     */
    readonly visiblePages = computed(() => {
        const totalPages = this.totalPages();
        const current = this.page();

        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1) as Array<number | string>;
        }

        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages] as Array<number | string>;
        }

        if (current >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as Array<number | string>;
        }

        return [1, '...', current - 1, current, current + 1, '...', totalPages] as Array<number | string>;
    });

    /** Navigate to a specific page number (1-indexed). Clamps to valid range. */
    goTo(pageNumber: number): void {
        const maxPage = this.totalPages();
        const next = Math.min(maxPage, Math.max(1, pageNumber));
        this.page.set(next);
    }

    /** Navigate to the previous page if possible. */
    prev(): void {
        this.goTo(this.page() - 1);
    }

    /** Navigate to the next page if possible. */
    next(): void {
        this.goTo(this.page() + 1);
    }
}
