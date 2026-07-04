"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type SubmitState = "idle" | "loading" | "success" | "error";

const subnewsletterOptions = [
  { value: "ai-engineering", label: "AI engineering" },
  { value: "open-source-intrigues", label: "Open Source Intrigues" },
  { value: "mobile-development", label: "Mobile development" },
  { value: "developer-tooling", label: "Developer tooling" },
  { value: "crypto-investing", label: "Crypto Investing" },
  { value: "security", label: "Security" },
  { value: "compliance", label: "Compliance" },
  { value: "financing-bootstrapping", label: "Financing & Bootstrapping" },
  { value: "lead-generation", label: "Lead Generation" },
  { value: "seo", label: "SEO" },
  { value: "cold-outreach-marketing", label: "Cold outreach marketing" },
  { value: "social-media-marketing", label: "Social Media marketing" },
  { value: "ads-advice", label: "Ads advice" },
  { value: "data-cloud-engineering", label: "Data & Cloud Engineering" },
];

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [subnewsletter, setSubnewsletter] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const listmonkUrl = process.env.NEXT_PUBLIC_LISTMONK_URL;
  const listmonkListUuid = process.env.NEXT_PUBLIC_LISTMONK_PUBLIC_LIST_UUID;
  const useListmonk = Boolean(listmonkUrl && listmonkListUuid);
  const showSubnewsletterPicker = email.trim().length > 0;

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    return createClient(url, anonKey);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const primaryTopic = subnewsletter || null;

    if (useListmonk) {
      const response = await fetch(
        `${listmonkUrl!.replace(/\/$/, "")}/api/public/subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            list_uuids: [listmonkListUuid],
            attribs: primaryTopic
              ? {
                  primary_topic: primaryTopic,
                }
              : {},
          }),
        }
      );

      if (!response.ok) {
        setStatus("error");
        setMessage("List signup failed. Check Listmonk public signup settings.");
        return;
      }

      setEmail("");
  setSubnewsletter("");
      setStatus("success");
      setMessage("You are on the list.");
      return;
    }

    if (!supabase) {
      setStatus("error");
      setMessage("Signup is not configured yet.");
      return;
    }

    const { error } = await supabase.from("newsletter_signups").insert({
      email: normalizedEmail,
      primary_topic: primaryTopic,
    });

    const missingPrimaryTopicColumn =
      error &&
      ((typeof error.code === "string" && error.code === "PGRST204") ||
        (typeof error.message === "string" && error.message.includes("primary_topic")));

    if (missingPrimaryTopicColumn) {
      const fallback = await supabase.from("newsletter_signups").insert({
        email: normalizedEmail,
      });

      if (!fallback.error) {
        setEmail("");
        setSubnewsletter("");
        setStatus("success");
        setMessage(
          "You are on the list. Run the latest Supabase signup SQL to start saving topic preferences."
        );
        return;
      }
    }

    if (error) {
      const duplicate = error.code === "23505";
      setStatus(duplicate ? "success" : "error");
      setMessage(
        duplicate
          ? "You are already on the list."
          : "Something went wrong. Please try again."
      );
      return;
    }

    setEmail("");
    setSubnewsletter("");
    setStatus("success");
    setMessage("You are on the list.");
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <label className="signup-label" htmlFor="email">
        Join the waitlist
      </label>
      <div className="signup-row">
        <input
          id="email"
          className="signup-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button className="button button-primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : "Get Early Access"}
        </button>
      </div>
      {showSubnewsletterPicker ? (
        <div className="signup-subnewsletter">
          <label className="signup-sublabel" htmlFor="subnewsletter">
            Pick a sub-newsletter to follow first
          </label>
          <select
            id="subnewsletter"
            className="signup-select"
            value={subnewsletter}
            onChange={(event) => setSubnewsletter(event.target.value)}
          >
            <option value="">Choose a topic (optional)</option>
            {subnewsletterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <p className={`signup-message signup-${status}`}>
        {message || "Thoughtful long-form curation, delivered by email."}
      </p>
    </form>
  );
}