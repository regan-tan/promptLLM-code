import { handleLogout } from "@/backend/handlers/auth.handler";

export async function POST() {
  return handleLogout();
}
