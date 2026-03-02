import { Suspense } from "react";

import PromptsPageClient from "@/components/prompts-page-client";

export default function PromptsPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <p className="muted">Loading prompts...</p>
        </main>
      }
    >
      <PromptsPageClient />
    </Suspense>
  );
}
