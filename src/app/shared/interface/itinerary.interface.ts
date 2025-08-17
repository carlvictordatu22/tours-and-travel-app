import { Entry } from './entry.type';

export interface ItineraryDay {
  date: Date;
  entries: Entry[];
}

export interface Itinerary {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  thumbnailUrl: string;
  days: ItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
} 