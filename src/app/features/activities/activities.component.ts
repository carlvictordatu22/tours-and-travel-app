import { ChangeDetectionStrategy, Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entries, Entry, EntryType, PaginationComponent, SkeletonComponent } from '../../shared';
import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tnt-activities',
  imports: [CommonModule, CardComponent, PaginationComponent, SkeletonComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly isLoading = signal(false);

  readonly pageSize = 12;
  readonly page = signal<number>(1);

  readonly allActivities: Signal<Entries> = computed(() =>
    ENTRIES.filter((entry: Entry) => entry.type === EntryType.ACTIVITY)
  );

  readonly totalActivities = computed(() => this.allActivities().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalActivities() / this.pageSize)));

  readonly activities: Signal<Entries> = computed(() => {
    const current = Math.min(this.totalPages(), Math.max(1, this.page()));
    const start = (current - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.allActivities().slice(start, end);
  });

  readonly activities$: Observable<Entries> = toObservable(this.activities).pipe(
    tap(() => this.isLoading.set(true)),
    delay(3000),
    tap(() => this.isLoading.set(false))
  );
  

  /** Bootstraps page state from URL and keeps it synced with the query param. */
  constructor() {
    // Read the initial '?page' on first load.
    const initial = Number(this.#route.snapshot.queryParamMap.get('page'));
    if (Number.isFinite(initial) && initial > 0) {
      this.page.set(Math.floor(initial));
    }

    // Keep '?page' in sync with the current page; omit it on page 1.
    effect(() => {
      const current = this.page();
      const currentParam = this.#route.snapshot.queryParamMap.get('page');
      const normalized = current !== 1 ? String(current) : null;
      const shouldUpdate = (normalized ?? null) !== (currentParam ?? null);
      
      if (shouldUpdate) {
        this.#router.navigate([], {
          relativeTo: this.#route,
          queryParams: { page: normalized },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }
}
