import bcrypt from "bcryptjs";

import { HttpError } from "@/backend/services/http-error.service";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validatePasswordPolicy(password: string): void {
  if (!PASSWORD_REGEX.test(password)) {
    throw new HttpError(
      400,
      "Password must include uppercase, lowercase, and a number (min 8 chars).",
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
