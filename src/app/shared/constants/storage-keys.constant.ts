export const STORAGE_KEYS = {
    FAVORITES: 'tnt_favorites',
    ITINERARIES: 'tnt_itineraries'
} as const;

export type StorageKeyName = keyof typeof STORAGE_KEYS;
