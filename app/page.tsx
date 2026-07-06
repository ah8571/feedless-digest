import Link from "next/link";
import { archiveIssues } from "./archive-issues";
import { SignupForm } from "./components/signup-form";

const sourcingChannels = [
  "Developer blogs like dev.to, Hashnode, and Hackernoon",
  "Structured discussion hubs like Hacker News, Reddit, Lemmy, and Indie Hackers",
  "Social platforms where thoughtful threads and essays get buried by short-form churn",
];

const trackedPlatforms = [
  {
    category: "Open blog forums",
    platforms: "dev.to, Hashnode, Medium, Hackernoon",
  },
  {
    category: "Structured social forums",
    platforms: "Hacker News, Reddit, Lemmy, Indie Hackers",
  },
  {
    category: "Social media platforms",
    platforms: "X, LinkedIn, Threads",
  },
  {
    category: "Gated community platforms",
    platforms: "Discord forum channels",
  },
];

const audienceFits = [
  "Founders and operators who want ideas without platform addiction",
  "Developers trying to keep up with technical essays, not hot takes",
  "Marketers looking for durable playbooks instead of short viral clips",
];

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero card-grid">
        <div className="hero-copy panel panel-accent">
          <p className="eyebrow">A newsletter for people who value signal</p>
          <h1>Read blog length social posts without doom scrolling.</h1>

          <SignupForm />

          <p className="lede">
            Feedfree Digest isolates substantive posts, deep threads, and
            long-form discussions from the forums and social platforms where the
            best ideas are usually hidden behind hours of scrolling.
          </p>

          <div className="cta-row">
            <Link className="button button-secondary" href="/advertise">
              Advertise With Us
            </Link>
          </div>
        </div>

        <aside className="hero-aside panel">
          <span className="stat-label">Platforms we track</span>
          {trackedPlatforms.map((group) => (
            <p className="stat-copy" key={group.category}>
              <strong>{group.category}:</strong> {group.platforms}
            </p>
          ))}
          <div className="mini-rule" />
          <span className="stat-label">What it replaces</span>
          <p className="stat-value">Hours of feed grazing</p>
          <p className="stat-copy">
            Instead of checking six platforms every morning, readers get a
            digest that surfaces the pieces worth opening.
          </p>
          <div className="mini-rule" />
          <span className="stat-label">What it preserves</span>
          <p className="stat-value">Depth, nuance, original sources</p>
        </aside>
      </section>

      <section className="content-grid">
        <article className="panel">
          <p className="section-label">Coverage</p>
          <h2>Built around high-signal corners of the web.</h2>
          <ul className="feature-list">
            {sourcingChannels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="section-label">Who this is for</p>
          <h2>Readers who want compounding insight, not compounding screen time.</h2>
          <ul className="feature-list">
            {audienceFits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <p className="section-label">Past Editions</p>
          <h2>See past editions</h2>
        </div>

        <div className="workflow-grid">
          {archiveIssues.filter((issue) => issue.title).map((issue) => (
            <article className="panel workflow-card" key={issue.id}>
              {issue.date ? <span className="step-chip">{issue.date}</span> : null}
              {issue.title ? <h3>{issue.title}</h3> : null}
              {issue.summary ? <p>{issue.summary}</p> : null}
              {issue.title ? (
                <Link className="text-link" href={`/archive#${issue.id}`}>
                  Jump to this edition in the archive
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}