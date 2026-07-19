import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { PrivacyOptOut } from "./components/privacy-optout";

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
                    return;
                  }

                  var keys = ['twclid','gclid','fbclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
                  var params = new URLSearchParams(window.location.search);
                  for (var i = 0; i < keys.length; i++) {
                    var v = params.get(keys[i]);
                    if (v) sessionStorage.setItem(keys[i], v);
                  }

                  // Fallback: extract params from document.referrer.
                  var ref = document.referrer;
                  if (ref) {
                    try {
                      var refParams = new URLSearchParams(ref.split('?')[1] || '');
                      for (var j = 0; j < keys.length; j++) {
                        var rv = refParams.get(keys[j]);
                        if (rv && !sessionStorage.getItem(keys[j])) {
                          sessionStorage.setItem(keys[j], rv);
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
              <PrivacyOptOut label={privacyOptOutLabel} />
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}