"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Prompt } from "@/components/prompt-types";

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    async function fetchPrompt() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/prompts/${params.id}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Prompt not found.");
        }
        setPrompt(payload.data as Prompt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Prompt not found.");
      } finally {
        setLoading(false);
      }
    }

    void fetchPrompt();
  }, [params.id]);

  async function copyPrompt() {
    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(`${prompt.title}\n\n${prompt.body}`);
    setCopied("Prompt copied.");
    setTimeout(() => setCopied(""), 1300);
  }

  async function sharePrompt() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied("Share link copied.");
    setTimeout(() => setCopied(""), 1300);
  }

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="container stack">
      <header className="topbar">
        <div>
          <p className="brand">Prompt Detail</p>
          <p className="muted">Read, copy, and share.</p>
        </div>
        <div className="row">
          <Link href="/prompts">All prompts</Link>
          <button className="secondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      {loading && <p className="muted">Loading prompt...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && prompt && (
        <article className="card stack">
          <h1 className="prompt-title">{prompt.title}</h1>
          <p className="muted mono">Author: {prompt.authorId}</p>
          <p className="prompt-body">{prompt.body}</p>
          <div className="row">
            {prompt.tags.map((tag) => (
              <span className="tag" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
          <div className="row">
            <button onClick={copyPrompt} type="button">
              Copy Prompt
            </button>
            <button className="ghost" onClick={sharePrompt} type="button">
              Share
            </button>
          </div>
          {copied && <p className="muted">{copied}</p>}
        </article>
      )}
    </main>
  );
}
