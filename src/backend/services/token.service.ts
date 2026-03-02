import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

import { AuthTokenPayload } from "@/backend/models/auth.model";
import { HttpError } from "@/backend/services/http-error.service";

export const AUTH_COOKIE_NAME = "prompt_library_token";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, "JWT_SECRET is missing.");
  }

  return secret;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string") {
      throw new Error("Unexpected JWT payload.");
    }

    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
    };
  } catch {
    throw new HttpError(401, "Invalid or expired session.");
  }
}

export function requireAuth(request: NextRequest): AuthTokenPayload {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    throw new HttpError(401, "Authentication required.");
  }

  return verifyAuthToken(token);
}
