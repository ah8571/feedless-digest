"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { subnewsletterOptions } from "../lib/topics";

type SubmitState = "idle" | "loading" | "success" | "error";

type LoadedPreferences = {
  email: string;
  status: string;
  topics: string[];
};

const statusContent = {
  confirmed: {
    eyebrow: "Subscription Confirmed",
    title: "Thanks for subscribing.",
    body: "Your email is confirmed and you are on the list for Feedfree Digest updates.",
  },
  unsubscribed: {
    eyebrow: "Unsubscribed",
    title: "You have been removed from the list.",
    body: "Your email is no longer subscribed to Feedfree Digest updates.",
  },
  invalid: {
    eyebrow: "Confirmation Link",
    title: "That link is no longer valid.",
    body: "The confirmation link may have expired or already been used. If needed, you can subscribe again from the homepage.",
  },
  error: {
    eyebrow: "Confirmation Error",
    title: "We could not confirm your email just now.",
    body: "Please try the link again in a moment. If the problem continues, subscribe again or reply once support contact details are live.",
  },
} as const;

function SubscribedPageContent() {
  const searchParams = useSearchParams();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<LoadedPreferences | null>(null);
  const [loadState, setLoadState] = useState<SubmitState>("idle");
  const [saveState, setSaveState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const rawStatus = searchParams.get("status");
  const token = searchParams.get("token")?.trim() ?? "";
  const statusKey =
    rawStatus === "invalid" || rawStatus === "error" || rawStatus === "unsubscribed"
      ? rawStatus
      : "confirmed";
  const content = statusContent[statusKey];

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    return createClient(url, anonKey);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!supabase) {
      setLoadState("error");
      setMessage("Preferences are not configured yet.");
      return;
    }

    const client = supabase;

    let cancelled = false;

    async function loadPreferences() {
      setLoadState("loading");
      setMessage("Loading your newsletter preferences...");

      const { data, error } = await client.functions.invoke("manage-preferences", {
        body: {
          action: "load",
          token,
        },
      });

      if (cancelled) {
        return;
      }

      if (error || !data?.ok) {
        setLoadState("error");
        setMessage("That preferences link is no longer valid.");
        return;
      }

      const nextTopics = Array.isArray(data.topics) ? data.topics : [];
      setPreferences({
        email: data.email,
        status: data.status,
        topics: nextTopics,
      });
      setSelectedTopics(nextTopics);
      setLoadState("success");
      setMessage("");
    }

    loadPreferences().catch((error) => {
      console.error("Preference load failed", error);
      if (cancelled) {
        return;
      }
      setLoadState("error");
      setMessage("That preferences link is no longer valid.");
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, token]);

  async function savePreferences() {
    if (!supabase || !token) {
      setSaveState("error");
      setMessage("Preferences are not configured yet.");
      return;
    }

    const client = supabase;

    setSaveState("loading");
    setMessage("Saving your preferences...");

    const { data, error } = await client.functions.invoke("manage-preferences", {
      body: {
        action: "save",
        token,
        topics: selectedTopics,
      },
    });

    if (error || !data?.ok) {
      setSaveState("error");
      setMessage("We could not save your preferences right now.");
      return;
    }

    setPreferences((current) =>
      current
        ? {
            ...current,
            status: data.status,
            topics: Array.isArray(data.topics) ? data.topics : [],
          }
        : current
    );
    setSaveState("success");
    setMessage(
      data.status === "unsubscribed"
        ? "You have been removed from all Feedfree newsletters."
        : "Your topic preferences have been updated."
    );
  }

  async function unsubscribeAll() {
    if (!supabase || !token) {
      setSaveState("error");
      setMessage("Preferences are not configured yet.");
      return;
    }

    const client = supabase;

    setSaveState("loading");
    setMessage("Removing you from all newsletters...");

    const { data, error } = await client.functions.invoke("manage-preferences", {
      body: {
        action: "unsubscribe",
        token,
      },
    });

    if (error || !data?.ok) {
      setSaveState("error");
      setMessage("We could not unsubscribe you right now.");
      return;
    }

    setSelectedTopics([]);
    setPreferences((current) =>
      current
        ? {
            ...current,
            status: "unsubscribed",
            topics: [],
          }
        : current
    );
    setSaveState("success");
    setMessage("You have been removed from all Feedfree newsletters.");
  }

  if (token) {
    if (loadState === "loading" || loadState === "idle") {
      return (
        <div className="page-stack narrow-stack">
          <section className="panel panel-accent">
            <p className="eyebrow">Manage Preferences</p>
            <h1>Loading your settings.</h1>
            <p className="lede">{message || "Loading your newsletter preferences..."}</p>
          </section>
        </div>
      );
    }

    if (loadState === "error" || !preferences) {
      return (
        <div className="page-stack narrow-stack">
          <section className="panel panel-accent">
            <p className="eyebrow">Manage Preferences</p>
            <h1>That link is no longer valid.</h1>
            <p className="lede">{message || "Request a fresh email to manage your newsletter settings."}</p>
          </section>
        </div>
      );
    }

    return (
      <div className="page-stack narrow-stack">
        <section className="panel panel-accent">
          <p className="eyebrow">Manage Preferences</p>
          <h1>Choose which newsletters you want.</h1>
          <p className="lede">
            {preferences.email} can stay on the topics you want, or you can remove everything in one step.
          </p>
          <div className="signup-form">
            <fieldset className="signup-subnewsletter">
              <p className="signup-subhelp">Select one or more topics to keep receiving</p>
              <div className="signup-checklist" role="group" aria-label="Sub-newsletter topics">
                {subnewsletterOptions.map((option) => {
                  const checked = selectedTopics.includes(option.value);

                  return (
                    <label className="signup-checkitem" key={option.value}>
                      <input
                        className="signup-checkbox"
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedTopics((current) => [...current, option.value]);
                            return;
                          }

                          setSelectedTopics((current) =>
                            current.filter((topic) => topic !== option.value)
                          );
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="cta-row">
              <button
                className="button button-primary"
                type="button"
                onClick={savePreferences}
                disabled={saveState === "loading"}
              >
                {saveState === "loading" ? "Saving..." : "Save preferences"}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={unsubscribeAll}
                disabled={saveState === "loading"}
              >
                Unsubscribe from all
              </button>
            </div>
            <p className={`signup-message signup-${saveState}`} aria-live="polite">
              {message ||
                (preferences.status === "unsubscribed"
                  ? "You are currently unsubscribed from all topics."
                  : "Update your topics any time from this link.")}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="lede">{content.body}</p>
      </section>
    </div>
  );
}

export default function SubscribedPage() {
  return (
    <Suspense fallback={null}>
      <SubscribedPageContent />
    </Suspense>
  );
}