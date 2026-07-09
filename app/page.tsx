import Link from "next/link";
import { archiveIssues } from "./archive-issues";
import { SignupForm } from "./components/signup-form";

const trackedPlatforms = [
  {
    category: "Social media platforms",
    platforms: "X and LinkedIn",
  },
  {
    category: "Open blog forums",
    platforms: "Medium",
  },
];

const editionSeriesOrder = ["AI Engineering", "Social Media Marketing"] as const;

export default function HomePage() {
  const publishedIssues = archiveIssues.filter((issue) => issue.title);
  const editionSections = editionSeriesOrder
    .map((series) => ({
      series,
      issues: publishedIssues.filter((issue) => issue.series === series),
    }))
    .filter((section) => section.issues.length > 0);

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

      <section className="workflow-section">
        <div className="section-heading">
          <p className="section-label">Past Editions</p>
          <h2>See past editions</h2>
        </div>

        <div className="workflow-lanes">
          {editionSections.map((section) => (
            <div className="workflow-lane" key={section.series}>
              <div className="section-heading workflow-lane-heading">
                <p className="section-label">Edition Section</p>
                <h3>{section.series}</h3>
              </div>

              <div className="workflow-grid">
                {section.issues.map((issue) => (
                  <Link className="panel workflow-card workflow-card-link" href={`/archive#${issue.id}`} key={issue.id}>
                    {issue.date ? <span className="step-chip">{issue.date}</span> : null}
                    {issue.title ? <h3>{issue.title}</h3> : null}
                    {issue.summary ? <p>{issue.summary}</p> : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}