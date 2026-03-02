import { handleListTags } from "@/backend/handlers/prompt.handler";

export async function GET() {
  return handleListTags();
}
