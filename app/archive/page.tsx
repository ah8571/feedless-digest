import { archiveIssues } from "../archive-issues";

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
      </section>

      <section className="archive-list">
        {archiveIssues.map((issue) => (
          <article className="panel archive-card" id={issue.id} key={issue.id}>
            <p className="section-label">{issue.date}</p>
            {issue.title ? <h2>{issue.title}</h2> : null}
            {issue.summary ? <p>{issue.summary}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}