"use client";

import { useState } from "react";

type ShareEditionButtonProps = {
  path: string;
};

export function ShareEditionButton({ path }: ShareEditionButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const url = typeof window === "undefined" ? path : `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <div className="archive-share-group">
      <button className="button button-secondary" onClick={handleCopy} type="button">
        {status === "copied"
          ? "Link copied"
          : status === "error"
            ? "Copy failed"
            : "Copy review link"}
      </button>
      <a className="text-link" href={path}>
        Open anchored view
      </a>
    </div>
  );
}