import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Feedfree Digest privacy policy — how subscriber data is collected, used, and protected.",
};

export default function PrivacyPage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Privacy Policy</p>
        <h1>Privacy expectations should stay simple.</h1>
        <p className="lede">
          This starter copy is intentionally minimal. Replace it with your final
          policy once you choose an email provider, analytics stack, and archive
          setup.
        </p>
      </section>

      <section className="panel legal-copy">
        <h2>Data you may collect</h2>
        <p>
          If readers subscribe, you will likely collect an email address and any
          voluntary information they submit through forms or replies.
        </p>

        <h2>How data is used</h2>
        <p>
          Subscriber data should be used to deliver the newsletter, respond to
          inquiries, measure issue performance, and maintain the archive.
        </p>

        <h2>Third-party services</h2>
        <p>
          The final version of this policy should name your email platform,
          hosting provider, and analytics tooling, along with links to their own
          policies where appropriate.
        </p>
      </section>
    </div>
  );
}