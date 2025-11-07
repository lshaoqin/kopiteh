import type { ID } from "./common";

export interface Stall {
  stall_id: ID;
  venue_id: ID;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_open?: boolean | null;
  waiting_time?: number | null; // minutes
}
