import type { ID } from "./common";

export type UserRole = "admin" | "runner" | "user";

export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
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
}

export interface VerifyResetCodePayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface User {
  user_id: ID;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string; // ISO
}
