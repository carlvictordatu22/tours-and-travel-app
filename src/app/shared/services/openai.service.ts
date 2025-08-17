import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface SearchResult {
  query: string;
  results: any[];
  reasoning: string;
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  readonly #http = inject(HttpClient);
  readonly #apiKey = environment['OPENAI_API_KEY'] || '';
  readonly #baseUrl = 'https://api.openai.com/v1/chat/completions';

  /**
   * Search for relevant travel items using OpenAI API
   * @param userQuery - The user's search query
   * @param availableData - Array of available travel data to search through
   * @returns Observable of search results with reasoning
   */
  searchRelevantItems(userQuery: string, availableData: any[]): Observable<SearchResult> {
    if (!this.#apiKey) {
      return of({
        query: userQuery,
        results: [],
        reasoning: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment configuration.'
      });
    }

    if (!userQuery.trim()) {
      return of({
        query: userQuery,
        results: [],
        reasoning: 'Please provide a search query.'
      });
    }

    if (!availableData || availableData.length === 0) {
      return of({
        query: userQuery,
        results: [],
        reasoning: 'No travel data available for search.'
      });
    }

    // Smart data filtering to reduce tokens before sending to API
    const filteredData = this.#filterRelevantData(userQuery, availableData);
    
    if (filteredData.length === 0) {
      return of({
        query: userQuery,
        results: [],
        reasoning: 'No relevant travel data found for your query. Try different keywords or be more specific.'
      });
    }

    const prompt = this.#buildSearchPrompt(userQuery, filteredData);
    
    // Check if prompt is still too long and apply additional filtering if needed
    if (this.#isPromptTooLong(prompt)) {
      const furtherFilteredData = this.#filterRelevantData(userQuery, availableData).slice(0, 75);
      const shorterPrompt = this.#buildSearchPrompt(userQuery, furtherFilteredData);
      
      if (this.#isPromptTooLong(shorterPrompt)) {
        // If still too long, return a helpful message
        return of({
          query: userQuery,
          results: [],
          reasoning: 'Your search query is too complex. Please try a more specific search term or break it down into smaller parts.'
        });
      }
      
      // Use the shorter prompt
      return this.#makeOpenAIRequest(shorterPrompt, userQuery);
    }
    
    return this.#makeOpenAIRequest(prompt, userQuery);
  }

  /**
   * Smart data filtering to reduce tokens before sending to OpenAI API
   * This method pre-filters data based on user query to reduce the data sent to the API
   * @param userQuery - The user's search query
   * @param availableData - Array of available travel data
   * @returns Filtered array of relevant data
   */
  #filterRelevantData(userQuery: string, availableData: any[]): any[] {
    const query = userQuery.toLowerCase();
    const queryWords = query.split(/\s+/).filter(word => word.length > 2);
    
    // If query is very short, limit to a reasonable subset
    if (queryWords.length <= 1) {
      return availableData.slice(0, 100); // Limit to first 100 items for short queries
    }

    // Score each item based on relevance to the query
    const scoredData = availableData.map(item => {
      let score = 0;
      const itemText = `${item.title} ${item.description} ${item.type} ${item.location}`.toLowerCase();
      
      // Exact word matches get higher scores
      for (const word of queryWords) {
        if (itemText.includes(word)) {
          score += 10;
        }
        
        // Partial matches get lower scores
        if (itemText.includes(word.substring(0, Math.min(word.length, 4)))) {
          score += 3;
        }
      }
      
      // Boost scores for items that match multiple query aspects
      if (query.includes('hotel') && item.type === 'HOTEL') score += 5;
      if (query.includes('restaurant') && item.type === 'RESTAURANT') score += 5;
      if (query.includes('activity') && item.type === 'ACTIVITY') score += 5;
      
      // Location matching gets high priority
      if (query.includes(item.location.toLowerCase())) score += 8;
      
      return { ...item, score };
    });
    
    // Sort by score and take top relevant items
    const relevantData = scoredData
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 150); // Limit to top 150 most relevant items
    
    // If we don't have enough scored items, add some random items to provide variety
    if (relevantData.length < 50) {
      const remainingData = availableData.filter(item => 
        !relevantData.some(relevant => relevant.id === item.id)
      );
      const randomItems = this.#shuffleArray(remainingData).slice(0, 50 - relevantData.length);
      relevantData.push(...randomItems);
    }
    
    return relevantData;
  }

  /**
   * Estimate token count for a given text (rough approximation)
   * OpenAI uses approximately 4 characters per token for English text
   * @param text - The text to estimate tokens for
   * @returns Estimated token count
   */
  #estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if the prompt is likely to exceed token limits
   * @param prompt - The prompt to check
   * @returns True if prompt is too long
   */
  #isPromptTooLong(prompt: string): boolean {
    const estimatedTokens = this.#estimateTokenCount(prompt);
    // Leave some buffer for response tokens
    return estimatedTokens > 12000; // Conservative limit
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   * @param array - The array to shuffle
   * @returns A new shuffled array
   */
  #shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Build the search prompt for OpenAI API
   * @param userQuery - The user's search query
   * @param availableData - The filtered data to include in the prompt
   * @returns Formatted prompt string
   */
  #buildSearchPrompt(userQuery: string, availableData: any[]): string {
    // Create a more concise data representation to reduce tokens
    const dataSummary = availableData.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      location: item.location,
      price: item.priceUsd,
      rating: item.rating
    }));

    return `Query: "${userQuery}"

Available travel data (${availableData.length} items):
${JSON.stringify(dataSummary)}

Instructions:
1. Analyze the user's query for travel preferences and requirements
2. Find the most relevant items considering location, type, price, and rating
3. Return maximum 8 most relevant results
4. Provide clear reasoning for your selection

Return ONLY valid JSON with this structure:
{
  "query": "user's original query",
  "results": ["array of relevant item IDs"],
  "reasoning": "explanation of why these items were selected"
}`;
  }

  /**
   * Parse the OpenAI API response into a SearchResult
   * @param response - The OpenAI API response
   * @param userQuery - The original user query
   * @returns Parsed search result
   */
  #parseOpenAIResponse(response: OpenAIResponse, userQuery: string): SearchResult {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the parsed response
      if (!parsed.results || !Array.isArray(parsed.results)) {
        throw new Error('Invalid results array in response');
      }

      if (!parsed.reasoning || typeof parsed.reasoning !== 'string') {
        throw new Error('Invalid reasoning in response');
      }

      return {
        query: userQuery,
        results: parsed.results || [],
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return {
        query: userQuery,
        results: [],
        reasoning: 'Error parsing AI response. Please try again.'
      };
    }
  }

  /**
   * Make the actual OpenAI API request
   * @param prompt - The formatted prompt to send
   * @param userQuery - The original user query for error handling
   * @returns Observable of search results
   */
  #makeOpenAIRequest(prompt: string, userQuery: string): Observable<SearchResult> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.#apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a travel assistant that analyzes user queries and finds relevant travel items from a database. Return only valid JSON with the exact structure specified.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    return this.#http.post<OpenAIResponse>(this.#baseUrl, body, { headers }).pipe(
      map((response: OpenAIResponse) => this.#parseOpenAIResponse(response, userQuery)),
      catchError((error: any) => {
        console.error('OpenAI API error:', error);
        let errorMessage = 'Error calling OpenAI API. Please try again later.';
        
        if (error.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key configuration.';
        } else if (error.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (error.status === 500) {
          errorMessage = 'OpenAI service temporarily unavailable. Please try again later.';
        } else if (error.status === 400 && error.error?.error?.message?.includes('maximum context length')) {
          errorMessage = 'Search query too complex. Please try a more specific search term.';
        }
        
        return of({
          query: userQuery,
          results: [],
          reasoning: errorMessage
        });
      })
    );
  }
} 