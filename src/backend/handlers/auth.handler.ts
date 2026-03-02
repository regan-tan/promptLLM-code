import { NextRequest, NextResponse } from "next/server";

import {
  loginController,
  meController,
  signupController,
} from "@/backend/controllers/auth.controller";
import { toHttpError } from "@/backend/services/http-error.service";
import { AUTH_COOKIE_NAME, requireAuth } from "@/backend/services/token.service";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = await signupController(body);

    const response = NextResponse.json({ user: auth.user }, { status: 201 });
    setAuthCookie(response, auth.token);
    return response;
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = await loginController(body);

    const response = NextResponse.json({ user: auth.user }, { status: 200 });
    setAuthCookie(response, auth.token);
    return response;
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleLogout() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookie(response);
  return response;
}

export async function handleMe(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    const me = await meController(payload.userId);
    return NextResponse.json({ user: me }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}
