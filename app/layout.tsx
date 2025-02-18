import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "VLink - URL Shortener",
    template: "%s | VLink",
  },
  description: "Shorten your URLs with style. Create custom short links and QR codes instantly.",
  keywords: ["URL shortener", "link shortener", "QR code generator", "short URL", "custom links"],
  authors: [{ name: "Valentin Sawadogo" }],
  creator: "Valentin Sawadogo",
  publisher: "VLink",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vlink.vercel.app",
    title: "VLink - URL Shortener",
    description: "Shorten your URLs with style. Create custom short links and QR codes instantly.",
    siteName: "VLink",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "VLink - URL Shortener",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VLink - URL Shortener",
    description: "Shorten your URLs with style. Create custom short links and QR codes instantly.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cloud.typography.com/6704632/6693372/css/fonts.css"
        />
      </head>
      <body className={`font-gotham min-h-screen bg-gradient-to-b from-background to-background/80 ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
