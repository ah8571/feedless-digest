"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type SubmitState = "idle" | "loading" | "success" | "error";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

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

    if (!supabase) {
      setStatus("error");
      setMessage("Signup is not configured yet.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("newsletter_signups").insert({
      email: email.trim().toLowerCase(),
      source: "landing-page",
    });

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
      <p className={`signup-message signup-${status}`}>{message || "No spam. Just thoughtful long-form curation."}</p>
    </form>
  );
}