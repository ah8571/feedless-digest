import type { TopArticle } from "../top-articles";

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ArticleCard({ article }: { article: TopArticle }) {
  return (
    <a
      href={article.xUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="article-card panel"
    >
      <div className="article-card-header">
        <img
          src={article.authorAvatar}
          alt={article.authorHandle}
          className="article-card-avatar"
          loading="lazy"
          width={40}
          height={40}
        />
        <div className="article-card-author">
          <span className="article-card-name">{article.authorName}</span>
          <span className="article-card-handle">@{article.authorHandle}</span>
        </div>
      </div>

      <h3 className="article-card-title">{article.title}</h3>

      <div className="article-card-meta">
        <span>👁 {formatCount(article.impressions)}</span>
        <span>♥ {formatCount(article.likes)}</span>
        <span>{formatDate(article.date)}</span>
      </div>
    </a>
  );
}
