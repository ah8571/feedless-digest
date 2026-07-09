import { SignupForm } from "../components/signup-form";
import { archiveIssues } from "../archive-issues";
import { ShareEditionButton } from "./share-edition-button";

const inlineLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function renderInlineLinks(text: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlineLinkPattern)) {
    const [fullMatch, label, href] = match;
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <a
        className="archive-inline-link"
        href={href}
        key={`${href}-${matchIndex}`}
        rel="noreferrer"
        target="_blank"
      >
        {label}
      </a>,
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function ArchivePage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Archive</p>
        <h1>Past Issues</h1>
        <p className="lede">Scroll or jump straight to a specific date.</p>
      </section>

      <details className="archive-subscribe archive-subscribe-sticky">
        <summary className="archive-subscribe-toggle">Open subscription form</summary>
        <div className="archive-subscribe-panel panel panel-warm">
          <SignupForm />
        </div>
      </details>

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
            {issue.body?.length ? (
              <div className="archive-story-body">
                {issue.body.map((paragraph) => (
                  <p key={paragraph}>{renderInlineLinks(paragraph)}</p>
                ))}
              </div>
            ) : null}
            {issue.items?.length ? (
              <div className="archive-digest-list">
                {issue.itemsTitle ? <p className="archive-section-label">{issue.itemsTitle}</p> : null}
                {issue.items.map((item, index) => (
                  <section className="archive-digest-item" key={`${item.title}-${index}`}>
                    <h3>
                      {index + 1}.{" "}
                      {item.source ? (
                        <a
                          className="archive-linked-title"
                          href={item.source}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {item.title.trim()}
                        </a>
                      ) : (
                        item.title.trim()
                      )}
                    </h3>
                    <p className="archive-meta">
                      <strong>Author:</strong> {item.author}
                      {item.handle ? ` (${item.handle})` : ""}
                    </p>
                    <p className="archive-meta">
                      <strong>Date:</strong> {item.date}
                    </p>
                    {item.summary ? <p>{item.summary}</p> : null}
                  </section>
                ))}
              </div>
            ) : null}
            {issue.disclosure ? (
              <p className="archive-disclosure">{issue.disclosure}</p>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}