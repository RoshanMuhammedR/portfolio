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
  themeColor: "#ECEEE9",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#ECEEE9] text-[#121316] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#121316] focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
