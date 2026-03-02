import { NextRequest } from "next/server";

import {
  handleCreatePrompt,
  handleListPrompts,
} from "@/backend/handlers/prompt.handler";

export async function GET(request: NextRequest) {
  return handleListPrompts(request);
}

export async function POST(request: NextRequest) {
  return handleCreatePrompt(request);
}
