import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://feedfree.tech"),
  title: {
    default: "Feedfree Digest — Long-form signal without the feed",
    template: "%s — Feedfree Digest",
  },
  description:
    "A curated newsletter that isolates high-signal long-form posts from X, forums, and social platforms so you can stay informed without doomscrolling.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

const primaryNav = [
  { href: "/archive", label: "Archive" },
  { href: "/advertise", label: "Advertise With Us" },
];

const footerNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/advertise", label: "Advertise With Us" },
];

const privacyOptOutLabel = "Do Not Sell or Share My Personal Information";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  // Respect CCPA opt-out stored from footer link.
                  // This is an explicit choice — skip ALL param capture.
                  if (localStorage.getItem('ccpa_opt_out') === 'true') {
                    console.log('[feedfree] CCPA opt-out active — skipping all param capture.');
                    return;
                  }

                  var allKeys = ['twclid','gclid','fbclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
                  var clickIdKeys = ['twclid','gclid','fbclid'];

                  // Respect Global Privacy Control (GPC) signal.
                  // GPC is a browser-level \"do not track\" — we skip click IDs
                  // (ad attribution) but still capture UTM params for internal
                  // analytics so you can see traffic sources.
                  var gpcActive = false;
                  try { gpcActive = !!navigator.globalPrivacyControl; } catch(e) {}

                  var params = new URLSearchParams(window.location.search);
                  for (var i = 0; i < allKeys.length; i++) {
                    var key = allKeys[i];
                    // GPC: skip click IDs, allow UTM params
                    if (gpcActive && clickIdKeys.indexOf(key) !== -1) continue;
                    var v = params.get(key);
                    if (v) sessionStorage.setItem(key, v);
                  }

                  // Fallback: extract click IDs from document.referrer.
                  var ref = document.referrer;
                  if (ref && !gpcActive) {
                    try {
                      var refParams = new URLSearchParams(ref.split('?')[1] || '');
                      for (var j = 0; j < allKeys.length; j++) {
                        var rk = allKeys[j];
                        if (gpcActive && clickIdKeys.indexOf(rk) !== -1) continue;
                        var rv = refParams.get(rk);
                        if (rv && !sessionStorage.getItem(rk)) {
                          sessionStorage.setItem(rk, rv);
                        }
                      }
                    } catch(e) {}
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${fraunces.variable} ${workSans.variable}`}>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/">
              <span className="brand-mark"><img src="/icon.png" alt="" width="48" height="48" /></span>
              <span className="brand-copy">
                <strong>Feedfree Digest</strong>
                <span>Long-form signal without the feed</span>
              </span>
            </Link>

            <nav className="site-nav" aria-label="Primary">
              {primaryNav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <p>
              Feedfree Digest curates substantive writing from forums and social
              platforms so readers can stay informed without getting trapped in
              infinite feeds.
            </p>

            <nav className="footer-nav" aria-label="Footer">
              {footerNav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                className="privacy-optout-link"
                onClick={() => {
                  localStorage.setItem("ccpa_opt_out", "true");
                  // Clear any previously captured click data
                  ["twclid", "gclid", "fbclid"].forEach(function (k) {
                    try { sessionStorage.removeItem(k); } catch (_) {}
                  });
                  var el = document.getElementById("privacy-optout-msg");
                  if (el) {
                    el.style.display = "block";
                    setTimeout(function () { el.style.display = "none"; }, 4000);
                  }
                }}
              >
                {privacyOptOutLabel}
              </button>
            </nav>
            <p
              id="privacy-optout-msg"
              style={{ display: "none", marginTop: 8, fontSize: "0.85rem", color: "#6b6254" }}
            >
              Preference saved. Your click data will not be shared with ad platforms.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}