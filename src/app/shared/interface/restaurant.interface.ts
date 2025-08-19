import { Base } from './base.interface';

export interface Restaurant extends Base {
    reviewCount: number;
}

export type Restaurants = Restaurant[];
