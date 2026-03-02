export function normalizeSearchQuery(value?: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeTags(tags?: string[]): string[] {
  if (!tags) {
    return [];
  }

  const normalized = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(normalized));
}

export function splitCsvTags(value?: string): string[] {
  if (!value) {
    return [];
  }

  return normalizeTags(value.split(","));
}
