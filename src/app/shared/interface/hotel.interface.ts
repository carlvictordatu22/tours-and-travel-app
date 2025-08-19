import { Base } from './base.interface';

export interface Hotel extends Base {
    reviewCount: number;
}

export type Hotels = Hotel[];
