import { Base } from "./base.interface";

export interface Activity extends Base {
    durationHours: number;
}

export type Activities = Activity[];