import { NextRequest } from "next/server";

import { handleSignup } from "@/backend/handlers/auth.handler";

export async function POST(request: NextRequest) {
  return handleSignup(request);
}
