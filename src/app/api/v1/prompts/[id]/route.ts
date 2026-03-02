import { NextRequest } from "next/server";

import {
  handleDeletePrompt,
  handleGetPrompt,
  handleUpdatePrompt,
} from "@/backend/handlers/prompt.handler";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return handleGetPrompt(request, id);
}

export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return handleUpdatePrompt(request, id);
}

export async function DELETE(request: NextRequest, context: Context) {
  const { id } = await context.params;
  return handleDeletePrompt(request, id);
}
