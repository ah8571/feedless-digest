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
                  var params = new URLSearchParams(window.location.search);
                  var keys = ['twclid','gclid','fbclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
                  for (var i = 0; i < keys.length; i++) {
                    var v = params.get(keys[i]);
                    if (v) sessionStorage.setItem(keys[i], v);
                  }

                  // Fallback: extract click IDs from document.referrer.
                  // X (and other ad networks) often pass twclid/gclid in the
                  // referring URL before redirecting. The landing URL may have
                  // already been cleaned by the time this script runs.
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

                  // Debug: log what was captured (remove in production)
                  console.log('[feedfree] Captured params:', {
                    url: window.location.href,
                    referrer: ref,
                    stored: {
                      twclid: sessionStorage.getItem('twclid'),
                      utm_source: sessionStorage.getItem('utm_source'),
                      utm_medium: sessionStorage.getItem('utm_medium'),
                      utm_campaign: sessionStorage.getItem('utm_campaign'),
                    }
                  });
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
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}