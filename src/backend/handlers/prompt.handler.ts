import { NextRequest, NextResponse } from "next/server";

import {
  createPromptController,
  deletePromptController,
  getPromptController,
  listPromptsController,
  listTagsController,
  updatePromptController,
} from "@/backend/controllers/prompt.controller";
import { toHttpError } from "@/backend/services/http-error.service";
import { splitCsvTags } from "@/backend/services/search.service";
import { requireAuth } from "@/backend/services/token.service";

function parsePagination(
  searchParams: URLSearchParams,
): { page: number; limit: number } {
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit:
      Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10,
  };
}

export async function handleListPrompts(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = parsePagination(searchParams);
    const q = searchParams.get("q") ?? "";
    const tags = splitCsvTags(searchParams.get("tags") ?? undefined);

    const prompts = await listPromptsController({ q, tags, page, limit });
    return NextResponse.json({ data: prompts }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleCreatePrompt(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    const body = await request.json();
    const prompt = await createPromptController(payload.userId, body);
    return NextResponse.json({ data: prompt }, { status: 201 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleGetPrompt(_request: NextRequest, id: string) {
  try {
    const prompt = await getPromptController(id);
    return NextResponse.json({ data: prompt }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleUpdatePrompt(request: NextRequest, id: string) {
  try {
    const payload = requireAuth(request);
    const body = await request.json();
    const prompt = await updatePromptController(id, payload.userId, body);
    return NextResponse.json({ data: prompt }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleDeletePrompt(request: NextRequest, id: string) {
  try {
    const payload = requireAuth(request);
    await deletePromptController(id, payload.userId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}

export async function handleListTags() {
  try {
    const tags = await listTagsController();
    return NextResponse.json({ data: tags }, { status: 200 });
  } catch (error: unknown) {
    const httpError = toHttpError(error);
    return NextResponse.json(
      { error: httpError.message },
      { status: httpError.status },
    );
  }
}
