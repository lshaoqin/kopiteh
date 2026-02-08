import type { ID } from "./common";

export interface Table {
  table_id: ID;
  venue_id: ID;
  table_number: string;
  qr_code: string;
}
