import {
  AuthResponse,
  LoginInput,
  SignupInput,
} from "@/backend/models/auth.model";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
} from "@/backend/repositories/user.repository";
import { HttpError } from "@/backend/services/http-error.service";
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from "@/backend/services/password.service";
import { signAuthToken } from "@/backend/services/token.service";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim();
}

export async function signupController(input: SignupInput): Promise<AuthResponse> {
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!username || !email || !password) {
    throw new HttpError(400, "username, email, and password are required.");
  }

  validatePasswordPolicy(password);

  const [userByEmail, userByUsername] = await Promise.all([
    findUserByEmail(email),
    findUserByUsername(username),
  ]);

  if (userByEmail) {
    throw new HttpError(409, "Email already exists.");
  }

  if (userByUsername) {
    throw new HttpError(409, "Username already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ username, email, passwordHash });
  const token = signAuthToken({ userId: user.user_id, email: user.email });

  return {
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      email: user.email,
    },
  };
}

export async function loginController(input: LoginInput): Promise<AuthResponse> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    throw new HttpError(400, "email and password are required.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const matches = await verifyPassword(password, user.password_hash);
  if (!matches) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const token = signAuthToken({ userId: user.user_id, email: user.email });

  return {
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      email: user.email,
    },
  };
}

export async function meController(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return {
    userId: user.user_id,
    username: user.username,
    email: user.email,
  };
}
