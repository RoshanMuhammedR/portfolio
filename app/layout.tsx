import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { identityData } from "@/content/portfolioData";
import "./globals.css";

/** Product voice: everything that is not code is set in Jakarta. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/** The blueprint voice: labels, metrics, file paths, snippets. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const description =
  "Portfolio of Roshan Muhammed R, Full-stack engineer specializing in Next.js, React, NestJS, FastAPI, PostgreSQL, Redis, and high-performance distributed systems.";

const title = `${identityData.name} - Full-Stack Engineer Portfolio`;

export const metadata: Metadata = {
  metadataBase: new URL(identityData.liveSiteUrl),
  title,
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
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ECEEE9" },
    { media: "(prefers-color-scheme: dark)", color: "#16181C" },
  ],
};

/**
 * Resolves the theme before the first paint, so the page never shows the wrong
 * plate for a frame. It runs blocking and ahead of the body on purpose: this is
 * the one thing that cannot wait for hydration. Kept to a single expression and
 * wrapped in a try so a locked-down localStorage cannot break rendering.
 */
const themeBootstrap = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-on-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
