import type { ID } from "./common";

export interface Stall {
  stall_id: ID;
  venue_id: ID;
  name: string;
  description?: string | null;
  stall_image?: string | null;
  is_open?: boolean | null;
  waiting_time?: number | null; // minutes
}
