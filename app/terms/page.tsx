export default function TermsPage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Terms</p>
        <h1>Basic terms for a newsletter and archive site.</h1>
        <p className="lede">
          This page gives you a clean placeholder. Replace it with reviewed
          language before launch if you plan to sell sponsorships or premium
          access.
        </p>
      </section>

      <section className="panel legal-copy">
        <h2>Content use</h2>
        <p>
          Feedfree Digest should link to original sources and avoid republishing
          full third-party articles without permission.
        </p>

        <h2>No guarantees</h2>
        <p>
          Archive availability, publication cadence, and cited external links may
          change over time as platforms update their content or APIs.
        </p>

        <h2>Sponsorships</h2>
        <p>
          Paid placements should be clearly labeled to preserve trust with the
          audience and maintain a strong editorial boundary.
        </p>
      </section>
    </div>
  );
}