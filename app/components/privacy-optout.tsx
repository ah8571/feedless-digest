"use client";

import { useState } from "react";

export function PrivacyOptOut({ label }: { label: string }) {
  const [message, setMessage] = useState("");

  return (
    <>
      <button
        type="button"
        className="privacy-optout-link"
        onClick={() => {
          localStorage.setItem("ccpa_opt_out", "true");
          ["twclid", "gclid", "fbclid"].forEach((k) => {
            try {
              sessionStorage.removeItem(k);
            } catch (_) {
              /* noop */
            }
          });
          setMessage("You have opted out of sale/sharing.");
          setTimeout(() => setMessage(""), 4000);
        }}
      >
        {label}
      </button>
      {message && (
        <span
          style={{
            display: "block",
            marginTop: 8,
            fontSize: "0.85rem",
            color: "#6b6254",
          }}
        >
          {message}
        </span>
      )}
    </>
  );
}
