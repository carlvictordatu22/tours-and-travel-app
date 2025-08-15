import { EntryType } from "../enums";

export interface Base {
    id: string;
    type: EntryType;
    title: string;
    imageUrl: string;
    rating: number;
    description: string;
    location: string;
    priceUsd: number;
    isFavorite: boolean;
}