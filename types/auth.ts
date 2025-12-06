import type { ID } from "./common";

export type UserRole = "admin" | "runner" | "user";

export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  secretCode: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string; 
}

export interface LoginPayload {
  email: string;
  password: string; 
}

export interface ForgotPasswordPayload {
  email: string;
  name: string;
  newPassword: string;
}

export interface User {
  user_id: ID;
  email: string;
  name: string;
  role: UserRole;
  created_at: string; // ISO
}
