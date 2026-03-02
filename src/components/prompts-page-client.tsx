"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Prompt } from "@/components/prompt-types";

type AuthMe = {
  userId: string;
  username: string;
  email: string;
};

const SAVED_SEARCHES_KEY = "prompt-library-saved-searches";

export default function PromptsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState(searchParams.get("q") ?? "");
  const [tagsInput, setTagsInput] = useState(searchParams.get("tags") ?? "");

  const queryString = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    setQInput(searchParams.get("q") ?? "");
    setTagsInput(searchParams.get("tags") ?? "");
  }, [searchParams]);

  useEffect(() => {
    async function fetchMe() {
      try {
        const response = await fetch("/api/v1/auth/me");
        if (!response.ok) {
          setMe(null);
          return;
        }
        const payload = await response.json();
        setMe(payload.user as AuthMe);
      } catch {
        setMe(null);
      }
    }

    void fetchMe();
  }, []);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/v1/prompts/tags");
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        setAllTags((payload.data ?? []) as string[]);
      } catch {
        setAllTags([]);
      }
    }

    void fetchTags();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!stored) {
      return;
    }
    try {
      setSavedSearches(JSON.parse(stored) as string[]);
    } catch {
      setSavedSearches([]);
    }
  }, []);

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/prompts?${queryString}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load prompts.");
        }
        setPrompts((payload.data ?? []) as Prompt[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load prompts.");
      } finally {
        setLoading(false);
      }
    }

    void fetchPrompts();
  }, [queryString]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    if (qInput.trim()) {
      params.set("q", qInput.trim());
    } else {
      params.delete("q");
    }

    if (tagsInput.trim()) {
      params.set("tags", tagsInput.trim());
    } else {
      params.delete("tags");
    }

    params.set("page", "1");
    params.set("limit", "20");
    router.push(`/prompts?${params.toString()}`);
  }

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/login");
    router.refresh();
  }

  function handleSaveSearch() {
    const query = queryString || "page=1&limit=20";
    const next = Array.from(new Set([query, ...savedSearches])).slice(0, 8);
    setSavedSearches(next);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next));
  }

  async function handleShareSearch() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <main className="container stack">
      <header className="topbar">
        <div>
          <p className="brand">LLM Prompt Library</p>
          <p className="muted">
            {me ? `Logged in as ${me.username}` : "Browse prompts from everyone"}
          </p>
        </div>
        <div className="row">
          {me ? (
            <button className="secondary" onClick={handleLogout} type="button">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">
                <button className="secondary" type="button">
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button type="button">Sign up</button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="card stack">
        <form className="stack" onSubmit={applyFilters}>
          <div className="field">
            <label htmlFor="search-q">Search title/body</label>
            <input
              id="search-q"
              placeholder="e.g. email outreach"
              value={qInput}
              onChange={(event) => setQInput(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="search-tags">Tags (comma separated)</label>
            <input
              id="search-tags"
              placeholder="tech, business"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
            />
          </div>
          <div className="row">
            <button type="submit">Search</button>
            <button className="ghost" onClick={handleSaveSearch} type="button">
              Save Search
            </button>
            <button className="ghost" onClick={handleShareSearch} type="button">
              Share Search
            </button>
            <Link href="/prompts/new">
              <button className="secondary" type="button">
                New Prompt
              </button>
            </Link>
          </div>
        </form>
        {allTags.length > 0 && (
          <div className="row">
            {allTags.map((tag) => (
              <button
                className="ghost"
                key={tag}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("tags", tag);
                  params.set("page", "1");
                  params.set("limit", "20");
                  router.push(`/prompts?${params.toString()}`);
                }}
                type="button"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </section>

      {savedSearches.length > 0 && (
        <section className="card stack">
          <h2>Saved Searches</h2>
          <div className="stack">
            {savedSearches.map((saved) => (
              <Link className="mono muted" href={`/prompts?${saved}`} key={saved}>
                /prompts?{saved}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="stack">
        {loading && <p className="muted">Loading prompts...</p>}
        {error && <p className="error">{error}</p>}
        {!loading &&
          !error &&
          prompts.map((prompt) => (
            <article className="card stack" key={prompt.id}>
              <Link className="prompt-title" href={`/prompts/${prompt.id}`}>
                {prompt.title}
              </Link>
              <p className="muted mono">Author: {prompt.authorId}</p>
              <p className="prompt-body">{prompt.body.slice(0, 280)}</p>
              <div className="row">
                {prompt.tags.map((tag) => (
                  <span className="tag" key={`${prompt.id}-${tag}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        {!loading && !error && prompts.length === 0 && (
          <p className="muted">No prompts found.</p>
        )}
      </section>
    </main>
  );
}
