import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";
import { HttpError } from "@/backend/services/http-error.service";

export async function linkUserPrompt(
  userId: string,
  promptId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("user_prompt").upsert(
    {
      user_id: userId,
      prompt_id: promptId,
    },
    { onConflict: "user_id,prompt_id", ignoreDuplicates: true },
  );

  if (error) {
    throw new HttpError(500, error.message);
  }
}
