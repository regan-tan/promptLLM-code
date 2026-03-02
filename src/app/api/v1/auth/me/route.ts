import { NextRequest } from "next/server";

import { handleMe } from "@/backend/handlers/auth.handler";

export async function GET(request: NextRequest) {
  return handleMe(request);
}
