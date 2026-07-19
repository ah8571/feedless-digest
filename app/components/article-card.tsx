import type { TopArticle } from "../top-articles";

export function ArticleCard({ article }: { article: TopArticle }) {
  return (
    <a
      href={article.xUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="article-card panel"
    >
      <div className="article-card-author">
        <span className="article-card-handle">@{article.authorHandle}</span>
        <span className="article-card-date">{article.date}</span>
      </div>

      <h3 className="article-card-title">{article.title}</h3>

      <p className="article-card-summary">{article.summary}</p>
    </a>
  );
}
