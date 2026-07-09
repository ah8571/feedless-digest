import { SignupForm } from "../components/signup-form";
import { archiveIssues } from "../archive-issues";
import { ShareEditionButton } from "./share-edition-button";

export default function ArchivePage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Archive</p>
        <h1>A single running page for past issues.</h1>
        <p className="lede">
          Readers can scroll through previous editions here or jump straight to
          a specific date from the homepage. Over time, this becomes the public
          record of the best issues without forcing anyone back into the feed.
        </p>
        <details className="archive-subscribe">
          <summary className="archive-subscribe-toggle">
            Open the subscription form
          </summary>
          <div className="archive-subscribe-panel">
            <SignupForm />
          </div>
        </details>
      </section>

      <section className="archive-list">
        {archiveIssues.filter((issue) => issue.title).map((issue) => (
          <article className="panel archive-card" id={issue.id} key={issue.id}>
            {issue.aliases?.map((alias) => (
              <span aria-hidden="true" className="archive-anchor-alias" id={alias} key={alias} />
            ))}
            {issue.date ? <p className="section-label">{issue.date}</p> : null}
            {issue.title ? <h2>{issue.title}</h2> : null}
            {issue.summary ? <p>{issue.summary}</p> : null}
            <div className="archive-actions">
              <ShareEditionButton path={`/archive#${issue.id}`} />
            </div>
            {issue.intro ? <p>{issue.intro}</p> : null}
            {issue.volumeNote ? (
              <p className="archive-volume-note">{issue.volumeNote}</p>
            ) : null}
            {issue.items?.length ? (
              <div className="archive-digest-list">
                {issue.items.map((item, index) => (
                  <section className="archive-digest-item" key={item.title}>
                    <h3>
                      {index + 1}. {item.title}
                    </h3>
                    <p className="archive-meta">
                      <strong>Author:</strong> {item.author} ({item.handle})
                    </p>
                    <p className="archive-meta">
                      <strong>Date:</strong> {item.date}
                    </p>
                    {item.source ? (
                      <p className="archive-meta">
                        <strong>Source:</strong>{" "}
                        <a
                          className="text-link"
                          href={item.source}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open article
                        </a>
                      </p>
                    ) : null}
                    <p>{item.summary}</p>
                  </section>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}