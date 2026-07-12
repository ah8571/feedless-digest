"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { activeSubnewsletterOptions } from "../lib/topics";

function readClickSource(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const source: Record<string, string> = {};

  // Use document.referrer for reliable platform attribution
  // Survives Next.js hydration since it's set by the browser at navigation time
  try {
    const ref = document.referrer;
    if (ref) source.referrer = ref;
  } catch (_) {}

  // Try URL params for click IDs (fragile — Next.js strips these)
  const params = new URLSearchParams(window.location.search);
  const twclid = params.get("twclid");
  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");

  // Fall back to sessionStorage
  try {
    if (twclid) source.twclid = twclid;
    else { const v = sessionStorage.getItem("twclid"); if (v) source.twclid = v; }
    if (gclid) source.gclid = gclid;
    else { const v = sessionStorage.getItem("gclid"); if (v) source.gclid = v; }
    if (fbclid) source.fbclid = fbclid;
    else { const v = sessionStorage.getItem("fbclid"); if (v) source.fbclid = v; }
  } catch (_) {}

  return source;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const listmonkUrl = process.env.NEXT_PUBLIC_LISTMONK_URL;
  const listmonkListUuid = process.env.NEXT_PUBLIC_LISTMONK_PUBLIC_LIST_UUID;
  const useListmonk = Boolean(listmonkUrl && listmonkListUuid);
  const canSubmit = email.trim().length > 0 && topics.length > 0 && status !== "loading";
  const needsTopicSelection = email.trim().length > 0 && topics.length === 0 && status !== "loading";
  const isSuccess = status === "success";

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

    if (!canSubmit) {
      return;
    }

    setStatus("loading");
    setMessage("Submitting your signup...");

    const normalizedEmail = email.trim().toLowerCase();
    const selectedTopics = topics;

    try {
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
              attribs: selectedTopics.length
                ? {
                    topics: selectedTopics,
                  }
                : {},
            }),
          }
        );

        if (!response.ok) {
          setStatus("error");
          setMessage(`List signup failed (${response.status}). Check Listmonk public signup settings.`);
          return;
        }

        setEmail("");
        setTopics([]);
        setStatus("success");
        setMessage("You are on the list.");
        return;
      }

      if (!supabase) {
        setStatus("error");
        setMessage("Signup is not configured yet.");
        return;
      }

      const clickSource = readClickSource();

      const { data, error } = await supabase.functions.invoke("create-signup", {
        body: {
          email: normalizedEmail,
          topics: selectedTopics,
          click_source: Object.keys(clickSource).length > 0 ? clickSource : undefined,
        },
      });

      if (error) {
        console.error("Signup invoke failed", error);
        setStatus("error");
        setMessage(
          error.message
            ? `Signup failed: ${error.message}`
            : "We could not process your signup just now. Please try again."
        );
        return;
      }

      const signupStatus = data?.status;

      setEmail("");
      setTopics([]);
      setStatus("success");
      setMessage(
        signupStatus === "confirmed_existing"
          ? "You are already subscribed."
          : "Thanks for subscribing. Check your inbox to confirm your signup."
      );
    } catch (error) {
      console.error("Unexpected signup error", error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? `Signup failed: ${error.message}`
          : "Something unexpected went wrong during signup."
      );
    }
  }

  if (isSuccess) {
    return (
      <div className="signup-success-panel" aria-live="polite">
        <p className="signup-label">Join the newsletter</p>
        <h2 className="signup-success-title">
          {message === "You are already subscribed."
            ? "You are already subscribed"
            : "Thanks for subscribing"}
        </h2>
        <p className="signup-message signup-success">
          {message === "You are already subscribed."
            ? "This email is already confirmed on the list."
            : "Please confirm your email to finish joining the list."}
        </p>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <label className="signup-label" htmlFor="email">
        Join the newsletter
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
        <button className="button button-primary" type="submit" disabled={!canSubmit}>
          {status === "loading"
            ? "Saving..."
            : needsTopicSelection
              ? "Pick a Topic"
              : "Get Access"}
        </button>
      </div>
      <fieldset className="signup-subnewsletter">
        <p className="signup-subhelp">Choose one or more topics to follow</p>
        <div className="signup-checklist" role="group" aria-label="Sub-newsletter topics">
          {activeSubnewsletterOptions.map((option) => {
            const checked = topics.includes(option.value);

            return (
              <label className="signup-checkitem" key={option.value}>
                <input
                  className="signup-checkbox"
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setTopics((current) => [...current, option.value]);
                      return;
                    }

                    setTopics((current) => current.filter((topic) => topic !== option.value));
                  }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className={`signup-message signup-${status}`} aria-live="polite">
        {message ||
          (needsTopicSelection
            ? "Choose at least one topic to continue."
            : "Thoughtful long-form curation, delivered by email.")}
      </p>
    </form>
  );
}