import {
  Prompt,
  PromptCreateInput,
  PromptDbRow,
  PromptListInput,
  PromptUpdateInput,
} from "@/backend/models/prompt.model";
import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";
import { HttpError } from "@/backend/services/http-error.service";
import { normalizeSearchQuery, normalizeTags } from "@/backend/services/search.service";

function mapPromptRowToPrompt(row: PromptDbRow): Prompt {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function searchPrompts(input: PromptListInput): Promise<Prompt[]> {
  const supabase = getSupabaseAdmin();

  const normalizedQuery = normalizeSearchQuery(input.q);
  const normalizedTags = normalizeTags(input.tags);

  const { data, error } = await supabase.rpc("search_prompts_ci", {
    search_text: normalizedQuery,
    tag_filters: normalizedTags.length > 0 ? normalizedTags : null,
    page_number: input.page,
    page_size: input.limit,
  });

  if (error) {
    throw new HttpError(500, error.message);
  }

  const rows = (data ?? []) as PromptDbRow[];
  return rows.map(mapPromptRowToPrompt);
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .maybeSingle<PromptDbRow>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data ? mapPromptRowToPrompt(data) : null;
}

export async function createPrompt(
  input: PromptCreateInput & { authorId: string },
): Promise<Prompt> {
  const supabase = getSupabaseAdmin();

  const tags = normalizeTags(input.tags);
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      title: input.title,
      body: input.body,
      tags,
      author_id: input.authorId,
    })
    .select("*")
    .single<PromptDbRow>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return mapPromptRowToPrompt(data);
}

export async function updatePrompt(
  id: string,
  updates: PromptUpdateInput,
): Promise<Prompt> {
  const supabase = getSupabaseAdmin();

  const payload: Record<string, unknown> = {};

  if (typeof updates.title === "string") {
    payload.title = updates.title;
  }
  if (typeof updates.body === "string") {
    payload.body = updates.body;
  }
  if (updates.tags) {
    payload.tags = normalizeTags(updates.tags);
  }

  const { data, error } = await supabase
    .from("prompts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single<PromptDbRow>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return mapPromptRowToPrompt(data);
}

export async function deletePrompt(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("prompts").delete().eq("id", id);

  if (error) {
    throw new HttpError(500, error.message);
  }
}

export async function listDistinctTags(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("list_prompt_tags");

  if (error) {
    throw new HttpError(500, error.message);
  }

  return (data ?? []) as string[];
}
