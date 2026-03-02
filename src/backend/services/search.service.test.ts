import { describe, expect, test } from "vitest";

import { normalizeTags } from "./search.service";

describe("normalizeTags", () => {
  test("normalizes case, trims, and deduplicates tags", () => {
    const result = normalizeTags([" Tech ", "tech", "Business", "business"]);
    expect(result).toEqual(["tech", "business"]);
  });
});
