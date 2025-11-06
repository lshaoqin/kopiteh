import type { ID } from "./common";

export type UserRole = "admin" | "member";

export interface User {
  user_id: ID;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string; // ISO
}
