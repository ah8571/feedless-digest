import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Feedfree Digest privacy policy — how subscriber data is collected, used, and protected.",
};

export default function PrivacyPage() {
  return (
    <div className="page-stack narrow-stack">
      <section className="panel panel-accent">
        <p className="eyebrow">Privacy Policy</p>
        <h1>No cookies. No trackers. Just a newsletter.</h1>
        <p className="lede">
          We collect the minimum data needed to run the newsletter. We never
          sell your information, and we do not use cookies or client-side
          tracking on this site.
        </p>
      </section>

      <section className="panel legal-copy">
        <h2>What we collect</h2>
        <p>
          When you subscribe to Feedfree Digest, we collect your email address
          and the topic categories you choose. That's it. We do not collect
          names, IP addresses, browsing behavior, device fingerprints, or any
          other personal data.
        </p>

        <h2>How we use your data</h2>
        <ul>
          <li>To send you the newsletter issues you signed up for.</li>
          <li>To confirm your subscription via a one-time confirmation email.</li>
          <li>
            To measure the overall performance of our newsletter (e.g., how many
            subscribers we have in each topic).
          </li>
        </ul>

        <h2>Third-party services we rely on</h2>
        <p>
          We use the following services to operate the newsletter. Each receives
          only the data it needs to perform its function:
        </p>
        <ul>
          <li>
            <strong>Listmonk</strong> — stores your email, topic preferences, and
            subscription status so we can send you issues.{" "}
            <a href="https://listmonk.app/privacy" target="_blank" rel="noopener">
              Listmonk privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Supabase</strong> — hosts our signup database and runs the
            server-side functions that process subscriptions.{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener">
              Supabase privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Resend</strong> — delivers the confirmation email when you
            first sign up.{" "}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">
              Resend privacy policy
            </a>
            .
          </li>
          <li>
            <strong>GitHub Pages</strong> — hosts this website's static files;
            GitHub may collect standard server logs.{" "}
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">
              GitHub privacy statement
            </a>
            .
          </li>
        </ul>

        <h2>Ad conversion measurement</h2>
        <p>
          We occasionally run ads on platforms like X (Twitter) to let people
          know about the newsletter. When someone subscribes after clicking one
          of those ads, we want to know whether the ad was effective — so we
          do not waste money on ads that do not work.
        </p>
        <p>Here is exactly how that measurement works, and what it does not:</p>

        <h3>What happens</h3>
        <ol>
          <li>
            If you arrive via an ad on X, the URL may contain a click identifier
            (<code>twclid</code>) and UTM parameters (<code>utm_source=x</code>,
            <code>utm_medium=cpc</code>). Our website reads these from the URL
            in memory only — nothing is written to disk or stored in a cookie.
          </li>
          <li>
            When you submit the signup form, your email is sent to our server.
            The server hashes your email using SHA-256 before it ever leaves our
            infrastructure.
          </li>
          <li>
            If the signup came from a paid X ad (determined by the UTM
            parameters), our server sends <em>only</em> the hashed email and the
            click identifier back to X's Ads API. X uses these to confirm that
            someone who clicked the ad later subscribed — which helps us
            understand whether the ad was worth running.
          </li>
        </ol>

        <h3>What does NOT happen</h3>
        <ul>
          <li>We do not set cookies or use any form of browser storage for tracking.</li>
          <li>We do not build advertising profiles or audience segments.</li>
          <li>
            We do not retarget visitors with ads elsewhere on the web.
          </li>
          <li>
            We do not send your email or hashed email to any ad platform unless
            you arrived via an ad on that specific platform.
          </li>
          <li>
            We do not store click identifiers in our database — they are used
            once, in memory, for the conversion API call.
          </li>
        </ul>

        <h3>Why we believe this does not require cookie consent</h3>
        <p>
          This measurement is entirely server-to-server. No information is
          stored on your device. The hashed email sent to the ad platform is a
          one-way pseudonymous identifier that only the ad platform can
          reconcile — it cannot be reversed by anyone else. Under both GDPR
          (legitimate interest — measuring ad effectiveness) and the ePrivacy
          Directive (no storage or access to the end user's device), this
          approach does not require a cookie banner.
        </p>

        <h2>No cookies. No consent banner.</h2>
        <p>
          This site does not use cookies, localStorage, fingerprinting, or any
          other form of client-side tracking. Because we do not store or access
          information on your device, we do not display a cookie consent banner.
        </p>

        <h2>Your privacy rights</h2>
        <p>
          Depending on where you live, you may have rights under laws like the
          GDPR (EU/UK), CCPA/CPRA (California), or similar regulations. These
          can include the right to:
        </p>
        <ul>
          <li>Know what personal data we hold about you.</li>
          <li>Request that we delete your personal data.</li>
          <li>Opt out of the "sharing" of personal data for cross-context behavioral advertising.</li>
        </ul>

        <h3>California residents (CCPA/CPRA)</h3>
        <p>
          Under California law, the forwarding of a hashed email address to an
          ad platform for conversion measurement may be considered a "share" for
          cross-context behavioral advertising in some interpretations. While we
          believe our limited server-side measurement falls under the "service
          provider" and "business purpose" exceptions (since we are measuring
          our own ad performance, not building behavioral profiles for others),
          we want to make opting out simple.
        </p>
        <p>
          <strong>
            To opt out of all data sharing, simply unsubscribe from the
            newsletter.
          </strong>{" "}
          Every issue includes a one-click unsubscribe link. Once unsubscribed,
          your email is removed from our mailing list and no further data about
          you is processed or shared with any third party. You can also email{" "}
          <a href="mailto:privacy@feedfree.tech">privacy@feedfree.tech</a> to
          request immediate deletion of your data.
        </p>
        <p>
          We do not and will not sell personal information for money. The only
          "sharing" that occurs is the hashed-email conversion measurement
          described above, and only when you arrived via an ad from that
          platform.
        </p>

        <h3>EU/UK residents (GDPR)</h3>
        <p>
          Our legal basis for processing your email address is your consent
          (you chose to subscribe) and our legitimate interest in measuring
          whether our ads are effective (for the limited conversion measurement
          described above). You can withdraw consent at any time by
          unsubscribing. To request a copy of your data or its deletion, email{" "}
          <a href="mailto:privacy@feedfree.tech">privacy@feedfree.tech</a>.
        </p>

        <h2>Data retention</h2>
        <p>
          We keep your email address and topic preferences for as long as you
          remain subscribed. When you unsubscribe, your data is removed from our
          mailing list. Database backups may retain your information for up to
          30 days after deletion.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions or data requests, email{" "}
          <a href="mailto:privacy@feedfree.tech">privacy@feedfree.tech</a>.
        </p>

        <p className="policy-date">
          Last updated: July 16, 2026.
        </p>
      </section>
    </div>
  );
}