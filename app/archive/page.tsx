const sampleIssues = [
  {
    date: "July 2026",
    title: "Issue 001",
    description:
      "A placeholder for your first digest with links to standout posts, community threads, and source discussions.",
  },
  {
    date: "Future-ready",
    title: "Archive System",
    description:
      "As issues ship, this page can become a dated index with issue summaries and direct links to each curated source.",
  },
];

export default function ArchivePage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Archive</p>
        <h1>A permanent home for past issues.</h1>
        <p className="lede">
          This page is designed to become the searchable record of your curation.
          It gives readers a way to revisit topics by date without returning to
          the platforms themselves.
        </p>
      </section>

      <section className="archive-list">
        {sampleIssues.map((issue) => (
          <article className="panel archive-card" key={issue.title}>
            <p className="section-label">{issue.date}</p>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}