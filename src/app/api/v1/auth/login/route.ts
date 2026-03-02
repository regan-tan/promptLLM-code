import { NextRequest } from "next/server";

import { handleLogin } from "@/backend/handlers/auth.handler";

export async function POST(request: NextRequest) {
  return handleLogin(request);
}
