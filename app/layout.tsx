import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { GridBackdrop } from "@/components/layout/GridBackdrop";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Full-stack engineer building product surfaces in Next.js and React over NestJS and FastAPI APIs, with PostgreSQL, Redis and queue-backed workers underneath.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description,
  keywords: [
    "Roshan Muhammed",
    "full-stack engineer",
    "Next.js",
    "NestJS",
    "FastAPI",
    "TypeScript",
    "PostgreSQL",
    "Redis",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Reveal-on-scroll starts at opacity 0 and is turned on by an observer.
            Without JS there is no observer, so the page must opt out entirely. */}
        <noscript>
          <style>{`.reveal{opacity:1;transform:none}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:border focus:border-accent focus:bg-canvas focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:text-accent focus:uppercase"
        >
          Skip to content
        </a>

        <GridBackdrop />
        <SiteHeader />

        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>

        <SiteFooter />

        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#101013",
              border: "1px solid #ffffff26",
              color: "#ededef",
              borderRadius: "0",
              fontSize: "0.8125rem",
            },
          }}
        />
      </body>
    </html>
  );
}
