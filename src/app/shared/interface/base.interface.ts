import { EntryType, Location } from "../enums";

export interface Base {
    id: string;
    type: EntryType;
    title: string;
    imageUrl: string;
    rating: number;
    description: string;
    location: Location;
    priceUsd: number;
    isFavorite: boolean;
}