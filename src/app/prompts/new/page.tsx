"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PromptForm = {
  title: string;
  body: string;
  tags: string;
};

export default function NewPromptPage() {
  const router = useRouter();
  const [form, setForm] = useState<PromptForm>({
    title: "",
    body: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/v1/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          tags,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(payload.error ?? "Failed to create prompt.");
      }

      router.push(`/prompts/${payload.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container stack">
      <header className="topbar">
        <div>
          <p className="brand">New Prompt</p>
          <p className="muted">Create and publish your prompt.</p>
        </div>
        <Link href="/prompts">Back to prompts</Link>
      </header>

      <section className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="prompt-title">Title</label>
            <input
              id="prompt-title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label htmlFor="prompt-body">Body</label>
            <textarea
              id="prompt-body"
              value={form.body}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, body: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label htmlFor="prompt-tags">Tags (comma separated)</label>
            <input
              id="prompt-tags"
              placeholder="studies, tech, sql"
              value={form.tags}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tags: event.target.value }))
              }
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button disabled={submitting} type="submit">
              {submitting ? "Publishing..." : "Publish Prompt"}
            </button>
            <Link href="/prompts">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
