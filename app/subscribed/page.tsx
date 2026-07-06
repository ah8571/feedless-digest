"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const statusContent = {
  confirmed: {
    eyebrow: "Subscription Confirmed",
    title: "Thanks for subscribing.",
    body: "Your email is confirmed and you are on the list for Feedfree Digest updates.",
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
  const rawStatus = searchParams.get("status");
  const statusKey = rawStatus === "invalid" || rawStatus === "error" ? rawStatus : "confirmed";
  const content = statusContent[statusKey];

  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="lede">{content.body}</p>
      </section>

      <section className="panel">
        <p className="section-label">Next Step</p>
        <h2>Return to the main site.</h2>
        <p>
          Feedfree Digest is focused on thoughtful long-form signal, with topic-based preferences already captured during signup.
        </p>
        <a className="button button-primary" href="/">
          Back to homepage
        </a>
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