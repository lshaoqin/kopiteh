import { runValidation, validateRequired } from "./base.validation";
import { BadRequestError } from "../controllers/errors";

// If you already declared these in ../types/payloads, import from there instead.
export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  role: string; // e.g. "admin" | "user"
}

export interface LoginPayload {
  email: string;
  password: string;
}

/* helpers (kept local to avoid changing base.validation) */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// tweak as you like (e.g., add special char rule)
function assertPasswordStrength(pass: string) {
  if (pass.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters.", { field: "password" });
  }
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) {
    throw new BadRequestError("Password must contain at least one letter and one digit.", {
      field: "password",
    });
  }
}

function assertEmail(email: string) {
  if (!EMAIL_RE.test(email)) {
    throw new BadRequestError("Invalid email format.", { field: "email" });
  }
}

function assertRole(role: string, allowed = ["admin", "user"]) {
  if (!allowed.includes(role)) {
    throw new BadRequestError(`role must be one of: ${allowed.join(", ")}`, {
      field: "role",
      value: role,
    });
  }
}

/* validators */
export function validateCreateAccount(payload: CreateAccountPayload) {
  runValidation([
    () => validateRequired(payload, ["name", "email", "password", "role"]),
    () => assertEmail(payload.email),
    () => assertPasswordStrength(payload.password),
    () => assertRole(payload.role),
  ]);
}

export function validateLogin(payload: LoginPayload) {
  runValidation([
    () => validateRequired(payload, ["email", "password"]),
    () => assertEmail(payload.email),
  ]);
}
