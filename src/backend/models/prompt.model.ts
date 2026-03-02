export type Prompt = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type PromptDbRow = {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type PromptCreateInput = {
  title: string;
  body: string;
  tags?: string[];
};

export type PromptUpdateInput = {
  title?: string;
  body?: string;
  tags?: string[];
};

export type PromptListInput = {
  q?: string;
  tags?: string[];
  page: number;
  limit: number;
};
