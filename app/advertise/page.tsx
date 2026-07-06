export default function AdvertisePage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Advertise With Us</p>
        <h1>Reach readers who are deliberately looking for depth.</h1>
        <p className="lede">
          Feedfree Digest is aimed at professionals who actively choose
          long-form writing over algorithmic noise. That makes it a strong fit
          for sponsorships tied to software tools, research products, education,
          recruiting, and operator-focused services.
        </p>
      </section>

      <section className="content-grid">
        <article className="panel">
          <p className="section-label">Ideal partners</p>
          <ul className="feature-list">
            <li>Developer tools and technical infrastructure products</li>
            <li>Founder software, workflow systems, and research platforms</li>
            <li>Education brands, cohorts, books, and long-form media</li>
          </ul>
        </article>

        <article className="panel">
          <p className="section-label">Initial inventory</p>
          <ul className="feature-list">
            <li>Single issue sponsorship</li>
            <li>Four-week category exclusivity</li>
            <li>Sponsored archive placement for evergreen offers</li>
          </ul>
        </article>
      </section>

      <section className="panel">
        <p className="section-label">Contact</p>
        <h2>Start with a lightweight sponsor deck.</h2>
        <p>
          Keep this page simple at first. Once audience data exists, add open
          rates, subscriber profile, sample issue links, and package pricing.
          For now, a direct contact path is enough.
        </p>
        <a className="button button-primary" href="mailto:ads@feedfree.tech?subject=Advertising%20Inquiry">
          Email for Sponsorship Details
        </a>
      </section>
    </div>
  );
}