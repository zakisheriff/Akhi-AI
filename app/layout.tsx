import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/index.css";
import "@/styles/App.css";
import "@/styles/ChatContainer.css";
import "@/styles/ChatInput.css";
import "@/styles/MessageBubble.css";
import "@/styles/TypingIndicator.css";
import "@/styles/TypewriterText.css";
import "@/styles/AmbientBackground.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://akhi.theoneatom.com'),
  title: "Akhi AI – Islamic AI Assistant",
  description: "Your trusted Islamic AI companion. Get authentic answers from the Quran, Hadith, and Islamic scholarship on prayer, fiqh, halal/haram, and more.",
  keywords: "Akhi AI, Islamic AI, Muslim AI, Quran AI, Hadith, halal, prayer times, fiqh, Islamic questions, Islamic chatbot",
  authors: [{ name: "The One Atom" }],
  openGraph: {
    title: "Akhi AI – Islamic AI Assistant",
    description: "Get authentic Islamic answers from Quran, Hadith & scholars",
    url: "https://akhi.theoneatom.com",
    siteName: "Akhi AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/akhi_logo.png",
        width: 1200,
        height: 630,
        alt: "Akhi AI - Islamic AI Assistant"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Akhi AI – Islamic AI Assistant",
    description: "Get authentic Islamic answers from Quran, Hadith & scholars",
    images: ["/akhi_logo.png"]
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: '#0d0d0d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Akhi AI",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "The One Atom",
      "url": "https://twitter.com/theoneatom"
    },
    "description": "Your trusted Islamic AI companion. Get authentic answers from the Quran, Hadith, and Islamic scholarship.",
    "url": "https://akhi.theoneatom.com"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
