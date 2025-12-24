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
    "url": "https://theoneatom.com"
  },
  "description": "Your trusted Islamic AI companion. Get authentic answers from the Quran, Hadith, and Islamic scholarship.",
  "url": "https://akhi.theoneatom.com"
};

export const metadata: Metadata = {
  metadataBase: new URL('https://akhi.theoneatom.com'),
  alternates: {
    canonical: "https://akhi.theoneatom.com/",
  },
  title: "Akhi AI – Your Brother in Faith & Knowledge",
  description: "Your trusted Islamic AI companion. Get authentic answers from the Quran, Hadith, and Islamic scholarship on prayer, fiqh, halal/haram, and more.",
  keywords: "Akhi AI, Islamic AI, Muslim AI, Quran AI, Hadith, halal, prayer times, fiqh, Islamic questions, Islamic chatbot",
  authors: [{ name: "The One Atom" }],
  openGraph: {
    title: "Akhi AI – Your Brother in Faith & Knowledge",
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
        alt: "Akhi AI - Your Brother in Faith & Knowledge"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Akhi AI – Your Brother in Faith & Knowledge",
    description: "Get authentic Islamic answers from Quran, Hadith & scholars",
    images: ["/akhi_logo.png"]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "script:ld+json": JSON.stringify(jsonLd),
  },
};

export const viewport = {
  themeColor: '#0d0d0d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
