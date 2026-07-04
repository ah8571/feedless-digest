import Link from "next/link";
import { SignupForm } from "./components/signup-form";

const sourcingChannels = [
  "Developer blogs like dev.to, Hashnode, and Hackernoon",
  "Structured discussion hubs like Hacker News, Reddit, Lemmy, and Indie Hackers",
  "Social platforms where thoughtful threads and essays get buried by short-form churn",
];

const workflowSteps = [
  {
    title: "Source",
    copy:
      "Pull article-length posts and discussion threads from targeted communities instead of asking readers to hunt for them manually.",
  },
  {
    title: "Filter",
    copy:
      "Use lightweight rules first: word count, engagement thresholds, recency, and forum-level quality cues before any AI summarization step.",
  },
  {
    title: "Publish",
    copy:
      "Package the best findings into a clean digest with direct links, context, and a permanent archive readers can revisit later.",
  },
];

const launchSteps = [
  {
    title: "Mailing stack",
    copy:
      "Run the newsletter operation on a small Linux droplet with Keila, Ghost, or Listmonk so the publishing system stays independent from the public site.",
  },
  {
    title: "Deliverability",
    copy:
      "Use Amazon SES or Resend with SPF, DKIM, and DMARC configured at the domain level so the digest lands reliably in inboxes.",
  },
  {
    title: "Sourcing script",
    copy:
      "Use n8n, Make, or Python to collect long-form candidates from X, LinkedIn, Reddit, Quora, and Hacker News before manual review.",
  },
  {
    title: "Editorial triage",
    copy:
      "Spend a short daily block reviewing the filtered queue in Airtable or Google Sheets, then publish only the genuinely worthwhile pieces.",
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
          <h1>Read the internet without living inside the feed.</h1>
          <p className="lede">
            Feedless Digest isolates substantive posts, deep threads, and
            long-form discussions from the forums and social platforms where the
            best ideas are usually hidden behind hours of scrolling.
          </p>

          <SignupForm />

          <div className="cta-row">
            <Link className="button button-secondary" href="/advertise">
              Advertise With Us
            </Link>
          </div>
        </div>

        <aside className="hero-aside panel">
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
          <p className="section-label">Why it matters</p>
          <h2>The problem is not lack of content. It is bad retrieval.</h2>
          <p>
            Your concept is strong because it does not try to compete with the
            platforms at their own game. It acts as a layer above them: find the
            worthwhile essays, remove the addictive interface, and preserve the
            original links.
          </p>
        </article>
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <p className="section-label">How the MVP should work</p>
          <h2>Keep the site simple. Put complexity in the ingestion pipeline.</h2>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <article className="panel workflow-card" key={step.title}>
              <span className="step-chip">{step.title}</span>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <p className="section-label">Launch architecture</p>
          <h2>The business works because the website and the publishing system are separate.</h2>
        </div>

        <div className="content-grid">
          {launchSteps.map((step) => (
            <article className="panel" key={step.title}>
              <span className="step-chip">{step.title}</span>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-grid audience-section">
        <article className="panel panel-warm">
          <p className="section-label">Who this is for</p>
          <h2>Readers who want compounding insight, not compounding screen time.</h2>
          <ul className="feature-list">
            {audienceFits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="section-label">Recommended stack</p>
          <h2>Use Vercel for the front end, and a separate system for email operations.</h2>
          <p>
            For the public website, a static-first Next.js app is enough. For
            delivery and sourcing, keep your mailing platform and automation
            pipeline separate so the site stays fast, cheap, and easy to reason
            about.
          </p>
          <Link className="text-link" href="/archive">
            View the archive page structure
          </Link>
        </article>
      </section>
    </div>
  );
}