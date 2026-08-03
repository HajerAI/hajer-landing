import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  alternates: { canonical: "/" },
  title: {
    default: `${site.name} — ${site.category}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "AI model migration",
    "model migration assessment",
    "AI evaluation",
    "production AI risk",
    "engineering decision support",
  ],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#090B0D",
  colorScheme: "dark",
};

/**
 * Structured data. Claims here are subject to the same truth constraints as
 * the page: no ratings, no reviews, no offers, no launch date — Organization
 * and WebSite only, which assert existence and identity, nothing more.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#org`,
      name: site.name,
      url: site.url,
      description: site.description,
      slogan: site.tagline,
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#site`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#org` },
    },
  ],
} as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full">{children}</body>
      <GoogleAnalytics gaId="G-PNJNM11W5B" />
    </html>
  );
}
