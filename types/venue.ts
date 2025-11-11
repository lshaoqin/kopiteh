import type { ID } from "./common";

export interface Venue {
  venue_id: ID;
  name: string;
  address: string;
  description?: string | null;
  image_url?: string | null;
  opening_hours?: string | null;
}
