import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VLink - URL Shortener",
  description: "Shorten your URLs with style",
  icons: {
    icon: '/favicon.ico',
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
