import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { identityData } from "@/content/portfolioData";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

/** One family carries the whole page; weight and tracking do the rest. */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

/** Metadata only - labels, dates, tags. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Portfolio of Roshan Muhammed R, a full-stack engineer building product surfaces in Next.js and React, APIs in NestJS and FastAPI, and the PostgreSQL, Redis and queue layers underneath.";

const title = `${identityData.name} - Full-stack engineer`;

export const metadata: Metadata = {
  metadataBase: new URL(identityData.liveSiteUrl),
  title: { default: title, template: `%s, ${identityData.name}` },
  description,
  keywords: [
    "Roshan Muhammed",
    "full-stack engineer",
    "Next.js",
    "React",
    "NestJS",
    "FastAPI",
    "TypeScript",
    "PostgreSQL",
    "Redis",
  ],
  authors: [{ name: identityData.name, url: identityData.liveSiteUrl }],
  creator: identityData.name,
  openGraph: {
    type: "website",
    url: identityData.liveSiteUrl,
    siteName: identityData.name,
    title,
    description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f9faf9",
};

/**
 * Applies a stored dark-theme choice before the first paint, so a reader who
 * chose dark never sees a flash of the light page. Light is the default, as on
 * the reference. Wrapped in a try so a locked-down localStorage cannot break
 * rendering.
 */
const themeBootstrap = `try{if(localStorage.getItem("theme")==="dark"){document.documentElement.dataset.theme="dark"}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh bg-n50 font-sans text-n900 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-10 focus:top-10 focus:z-[60] focus:rounded-lg focus:bg-n900 focus:px-5 focus:py-3 focus:text-[14px] focus:font-medium focus:text-n50"
        >
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
