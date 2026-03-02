import {
  PromptCreateInput,
  PromptListInput,
  PromptUpdateInput,
} from "@/backend/models/prompt.model";
import {
  createPrompt,
  deletePrompt,
  getPromptById,
  listDistinctTags,
  searchPrompts,
  updatePrompt,
} from "@/backend/repositories/prompt.repository";
import { linkUserPrompt } from "@/backend/repositories/user-prompt.repository";
import { HttpError } from "@/backend/services/http-error.service";
import { normalizeTags } from "@/backend/services/search.service";

export async function listPromptsController(input: PromptListInput) {
  return searchPrompts(input);
}

export async function getPromptController(id: string) {
  const prompt = await getPromptById(id);
  if (!prompt) {
    throw new HttpError(404, "Prompt not found.");
  }

  return prompt;
}

export async function createPromptController(
  userId: string,
  input: PromptCreateInput,
) {
  const title = input.title?.trim();
  const body = input.body?.trim();

  if (!title || !body) {
    throw new HttpError(400, "title and body are required.");
  }

  const prompt = await createPrompt({
    authorId: userId,
    title,
    body,
    tags: normalizeTags(input.tags),
  });

  await linkUserPrompt(userId, prompt.id);

  return prompt;
}

export async function updatePromptController(
  id: string,
  userId: string,
  updates: PromptUpdateInput,
) {
  const current = await getPromptById(id);
  if (!current) {
    throw new HttpError(404, "Prompt not found.");
  }
  if (current.authorId !== userId) {
    throw new HttpError(403, "Not allowed to update this prompt.");
  }

  if (updates.title !== undefined) {
    updates.title = updates.title.trim();
  }
  if (updates.body !== undefined) {
    updates.body = updates.body.trim();
  }
  if (updates.tags) {
    updates.tags = normalizeTags(updates.tags);
  }

  return updatePrompt(id, updates);
}

export async function deletePromptController(id: string, userId: string) {
  const current = await getPromptById(id);
  if (!current) {
    throw new HttpError(404, "Prompt not found.");
  }
  if (current.authorId !== userId) {
    throw new HttpError(403, "Not allowed to delete this prompt.");
  }

  await deletePrompt(id);
}

export async function listTagsController() {
  return listDistinctTags();
}
