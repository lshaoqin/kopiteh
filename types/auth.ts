import type { ID } from "./common";

export type UserRole = "admin" | "runner" | "user";

export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface User {
  user_id: ID;
  email: string;
  name: string;
  role: UserRole;
  created_at: string; // ISO
}
