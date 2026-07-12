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
      <body className={`${fraunces.variable} ${workSans.variable}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var params = new URLSearchParams(window.location.search);
  var twclid = params.get("twclid");
  if (twclid) { sessionStorage.setItem("twclid", twclid); console.log("twclid captured:", twclid); }
  var gclid = params.get("gclid");
  if (gclid) { sessionStorage.setItem("gclid", gclid); console.log("gclid captured:", gclid); }
  var fbclid = params.get("fbclid");
  if (fbclid) { sessionStorage.setItem("fbclid", fbclid); console.log("fbclid captured:", fbclid); }
})();
            `.trim(),
          }}
        />
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