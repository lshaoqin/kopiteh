export type ID = number;

export interface Timestamps {
  created_at?: string; // ISO
  updated_at?: string; // ISO
}

export type Decimal = number; // store/transport as number in API
