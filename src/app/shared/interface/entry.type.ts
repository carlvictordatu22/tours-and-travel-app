import { Activity } from './activity.interface';
import { Hotel } from './hotel.interface';
import { Restaurant } from './restaurant.interface';

export type Entry = Activity | Hotel | Restaurant;

export type Entries = Entry[];
