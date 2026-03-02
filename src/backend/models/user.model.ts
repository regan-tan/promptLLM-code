export type User = {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type UserPublic = {
  userId: string;
  username: string;
  email: string;
};

export function toUserPublic(user: User): UserPublic {
  return {
    userId: user.user_id,
    username: user.username,
    email: user.email,
  };
}
