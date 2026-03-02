import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";
import { User } from "@/backend/models/user.model";
import { HttpError } from "@/backend/services/http-error.service";

export async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle<User>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data;
}

export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle<User>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data;
}

export async function findUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<User>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data;
}

export async function createUser(input: {
  username: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username,
      email: input.email,
      password_hash: input.passwordHash,
    })
    .select("*")
    .single<User>();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data;
}
