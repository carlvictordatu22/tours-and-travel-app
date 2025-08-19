export interface ItineraryDraftDailyEntry {
    date: Date | null;
    selectedEntryIds: string[];
}

export interface ItineraryDraft {
    itineraryName: string;
    startDate: Date | null;
    endDate: Date | null;
    days: number;
    thumbnailDataUrl: string | null;
    dailyEntries: ItineraryDraftDailyEntry[];
}

export interface StoredDailyEntry {
    dateISO: string;
    selectedEntryIds: string[];
}

export interface StoredItinerary {
    id: string;
    itineraryName: string;
    startDateISO: string;
    endDateISO: string;
    days: number;
    thumbnailDataUrl: string | null;
    dailyEntries: StoredDailyEntry[];
    createdAtISO: string;
}
