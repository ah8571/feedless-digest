import { readFile } from "node:fs/promises";
import path from "node:path";

import { SignupForm } from "../components/signup-form";
import { archiveIssues } from "../archive-issues";
import { ShareEditionButton } from "./share-edition-button";

const inlineLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

type ParsedEditionItem = {
  title: string;
  href?: string;
  author: string;
  handle?: string;
  summary?: string;
  takeaways: string[];
};

type ParsedEditionSection = {
  title: string;
  items: ParsedEditionItem[];
};

type ParsedEdition = {
  intro?: string;
  body: string[];
  disclosure?: string;
  sections: ParsedEditionSection[];
};

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

function parseTitleLink(value: string) {
  const match = value.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);

  if (!match) {
    return { title: value.trim() };
  }

  return {
    title: match[1].trim(),
    href: match[2],
  };
}

function parseAuthorLine(value: string) {
  const authorValue = value.replace(/^Author:\s*/, "").trim();
  const match = authorValue.match(/^(.*?)(?:\s+\((@[^)]+)\))?$/);

  return {
    author: match?.[1]?.trim() || authorValue,
    handle: match?.[2],
  };
}

function parseEditionMarkdown(content: string): ParsedEdition | null {
  const lines = content.split(/\r?\n/);
  const sections: ParsedEditionSection[] = [];
  const body: string[] = [];
  let intro: string | undefined;
  let disclosure: string | undefined;
  let currentSection: ParsedEditionSection | null = null;
  let index = 0;

  while (index < lines.length && !lines[index].startsWith("## ")) {
    const line = lines[index].trim();

    if (!line || line.startsWith("# ")) {
      index += 1;
      continue;
    }

    if (line.startsWith("[disclosure:")) {
      disclosure = line;
      index += 1;
      continue;
    }

    if (!intro) {
      intro = line;
    } else {
      body.push(line);
    }

    index += 1;
  }

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("[disclosure:")) {
      disclosure = line;
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      currentSection = {
        title: line.replace(/^##\s+/, "").trim(),
        items: [],
      };
      sections.push(currentSection);
      index += 1;
      continue;
    }

    if (!line.startsWith("### ") || !currentSection) {
      index += 1;
      continue;
    }

    const titleLine = line.replace(/^###\s+/, "").trim();
    const title = parseTitleLink(titleLine);
    const authorLine = lines[index + 1]?.trim() ?? "";
    const { author, handle } = parseAuthorLine(authorLine);

    index += 2;

    while (index < lines.length && !lines[index].trim()) {
      index += 1;
    }

    const summary = lines[index]?.trim();
    if (summary) {
      index += 1;
    }

    const takeaways: string[] = [];
    while (index < lines.length) {
      const takeawayLine = lines[index].trim();

      if (!takeawayLine) {
        index += 1;
        continue;
      }

      if (takeawayLine.startsWith("## ") || takeawayLine.startsWith("### ") || takeawayLine.startsWith("[disclosure:")) {
        break;
      }

      if (takeawayLine.startsWith("- ")) {
        takeaways.push(takeawayLine.slice(2).trim());
      }

      index += 1;
    }

    currentSection.items.push({
      title: title.title,
      href: title.href,
      author,
      handle,
      summary,
      takeaways,
    });
  }

  if (!intro && sections.length === 0) {
    return null;
  }

  return {
    intro,
    body,
    disclosure,
    sections,
  };
}

async function readLinkedEdition(alias: string | undefined) {
  if (!alias) {
    return null;
  }

  const filePath = path.join(process.cwd(), "lists", "editions", `${alias}-feedfree-linked.md`);

  try {
    const content = await readFile(filePath, "utf8");
    return parseEditionMarkdown(content);
  } catch {
    return null;
  }
}

export default async function ArchivePage() {
  const issues = await Promise.all(
    archiveIssues
      .filter((issue) => issue.title)
      .map(async (issue) => ({
        issue,
        edition: await readLinkedEdition(issue.aliases?.[0]),
      })),
  );

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
        {issues.map(({ issue, edition }) => (
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
            {edition?.intro ?? issue.intro ? <p>{edition?.intro ?? issue.intro}</p> : null}
            {issue.volumeNote ? (
              <p className="archive-volume-note">{issue.volumeNote}</p>
            ) : null}
            {(edition?.body.length ? edition.body : issue.body)?.length ? (
              <div className="archive-story-body">
                {(edition?.body.length ? edition.body : issue.body ?? []).map((paragraph) => (
                  <p key={paragraph}>{renderInlineLinks(paragraph)}</p>
                ))}
              </div>
            ) : null}
            {edition?.sections.length ? (
              <div className="archive-digest-list">
                {edition.sections.map((section) => (
                  <div key={section.title}>
                    <p className="archive-section-label">{section.title}</p>
                    {section.items.map((item) => (
                      <section className="archive-digest-item" key={`${section.title}-${item.title}`}>
                        <h3>
                          {item.href ? (
                            <a
                              className="archive-linked-title"
                              href={item.href}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {item.title}
                            </a>
                          ) : (
                            item.title
                          )}
                        </h3>
                        <p className="archive-meta">
                          <strong>Author:</strong> {item.author}
                          {item.handle ? ` (${item.handle})` : ""}
                        </p>
                        {item.summary ? <p>{item.summary}</p> : null}
                        {item.takeaways.length ? (
                          <ul>
                            {item.takeaways.map((takeaway) => (
                              <li key={takeaway}>{takeaway}</li>
                            ))}
                          </ul>
                        ) : null}
                      </section>
                    ))}
                  </div>
                ))}
              </div>
            ) : issue.items?.length ? (
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
            {edition?.disclosure ?? issue.disclosure ? (
              <p className="archive-disclosure">{edition?.disclosure ?? issue.disclosure}</p>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}