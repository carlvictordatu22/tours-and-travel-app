import { ChangeDetectionStrategy, Component, Signal, WritableSignal, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ENTRIES, Entry, FavoritesService, SkeletonComponent, EmptyCardComponent } from '../../shared';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'tnt-ai-search',
    imports: [CommonModule, CardComponent, SkeletonComponent, EmptyCardComponent, ButtonComponent],
    templateUrl: './ai-search.component.html',
    styleUrl: './ai-search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AISearchComponent {
    readonly #favorites = inject(FavoritesService);

    readonly query: WritableSignal<string> = signal('');
    readonly loading: WritableSignal<boolean> = signal(false);
    readonly error: WritableSignal<string | null> = signal(null);
    readonly results: WritableSignal<Entry[]> = signal([]);
    readonly hasSearched: WritableSignal<boolean> = signal(false);
    readonly suggestions: string[] = [
        'Family-friendly hotels in London under $200',
        'Best seafood near Paris',
        'Top-rated activities in Spain',
        'Romantic restaurants in Paris',
        'Budget stays near London center'
    ];

    readonly hasQuery: Signal<boolean> = computed(() => this.query().trim().length > 0);

    /**
     * Updates the search query from input value.
     * @param value New input text from the search field
     * @returns void
     */
    onInput(value: string): void {
        this.query.set(value);
    }

    /**
     * Handles form submit and triggers AI search.
     * @param event Form submit event
     * @returns void
     */
    onSubmit(event: Event): void {
        event.preventDefault();
        const query = this.query().trim();

        if (!query) {
            this.hasSearched.set(false);

            return;
        }

        this.hasSearched.set(true);
        this.#search(query).catch(() => void 0);
    }

    /** Sets the query from a suggestion and searches immediately */
    useSuggestion(value: string): void {
        this.query.set(value);
        // Simulate submit without event
        this.hasSearched.set(true);
        this.#search(value).catch(() => void 0);
    }

    /** Updates favorite state via the global FavoritesService */
    onFavoriteChange(id: string, value: boolean): void {
        this.#favorites.setFavorite(id, value);
    }

    /** Clears the current query and results */
    clearSearch(): void {
        this.query.set('');
        this.error.set(null);
        this.results.set([]);
        this.hasSearched.set(false);
    }

    /**
     * Calls OpenAI to select relevant entries and updates results.
     * @param userQuery Free-text query entered by the user
     * @returns Promise that resolves when results have been updated
     */
    async #search(userQuery: string): Promise<void> {
        this.loading.set(true);
        this.error.set(null);
        this.results.set([]);

        try {
            const candidates = this.#buildCandidates(userQuery, 25);

            const prompt = this.#buildPrompt(userQuery, candidates);
            const response = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${environment.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    input: prompt,
                    temperature: 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const text: string = data.output_text ?? data?.output?.[0]?.content?.[0]?.text ?? '';

            const ids = this.#extractIds(text);
            const idSet = new Set(ids);
            const selected = ENTRIES.filter((entry) => idSet.has(entry.id));

            this.results.set(selected);
        } catch (error) {
            console.log(error);
            this.error.set('Unable to fetch AI results. Please try again.');
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Builds a small, scored list of candidate entries for the model.
     * @param queryText User query used for lightweight client-side scoring
     * @param limit Maximum number of candidates to include
     * @returns Array of lightweight candidate entry objects
     */
    #buildCandidates(queryText: string, limit: number): Pick<Entry, 'id' | 'type' | 'title' | 'description' | 'location' | 'rating' | 'priceUsd'>[] {
        const terms = queryText
            .toLowerCase()
            .split(/[^a-z0-9]+/g)
            .filter(Boolean);
        const scoreEntry = (entry: Entry): number => {
            const hay = `${entry.title} ${entry.description} ${entry.location} ${entry.type}`.toLowerCase();
            let score = 0;
            for (const term of terms) {
                if (hay.includes(term)) {
                    score += 2;
                }
            }
            if (entry.rating >= 4.5) {
                score += 1;
            }

            return score;
        };

        return ENTRIES.map((entry) => ({ entry, score: scoreEntry(entry) }))
            .sort((entry1, entry2) => entry2.score - entry1.score)
            .slice(0, Math.max(5, limit))
            .map(({ entry }) => ({
                id: entry.id,
                type: entry.type,
                title: entry.title,
                description: entry.description,
                location: entry.location,
                rating: entry.rating,
                priceUsd: entry.priceUsd
            }));
    }

    /**
     * Builds a concise instruction for the Responses API.
     * @param userQuery Free-text query entered by the user
     * @param candidates Candidate entries to consider
     * @returns Prompt string for the Responses API
     */
    #buildPrompt(userQuery: string, candidates: Pick<Entry, 'id' | 'type' | 'title' | 'description' | 'location' | 'rating' | 'priceUsd'>[]): string {
        return [
            'You are a travel search assistant. Given a user query and a small list of candidate entries,',
            'select the most relevant items. Return ONLY compact JSON with this exact shape:',
            '{"ids": ["ID1", "ID2", "ID3"]}.',
            'Include up to 12 ids, ordered by relevance. Do not include any extra text.',
            '',
            `User query: ${userQuery}`,
            `Candidates JSON: ${JSON.stringify(candidates)}`
        ].join('\n');
    }

    /**
     * Extracts an array of entry ids from the model output text.
     * @param text Raw output string returned by the Responses API
     * @returns Array of entry id strings
     */
    #extractIds(text: string): string[] {
        try {
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            const raw = jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;
            const parsed = JSON.parse(raw);
            const ids: unknown = parsed?.ids;

            return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
        } catch {
            return [];
        }
    }
}
