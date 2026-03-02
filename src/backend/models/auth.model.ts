export type AuthUser = {
  userId: string;
  username: string;
  email: string;
};

export type SignupInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type AuthTokenPayload = {
  userId: string;
  email: string;
};
