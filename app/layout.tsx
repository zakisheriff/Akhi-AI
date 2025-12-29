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

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Akhi AI",
  "url": "https://akhi.theoneatom.com",
  "logo": "https://akhi.theoneatom.com/akhi_logo.png",
  "sameAs": [
    "https://twitter.com/akhiai"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "url": "https://akhi.theoneatom.com"
  }
};

// WebSite Schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Akhi AI",
  "url": "https://akhi.theoneatom.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://akhi.theoneatom.com/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// SoftwareApplication Schema
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Akhi AI",
  "applicationCategory": "ChatApplication",
  "operatingSystem": "Web",
  "url": "https://akhi.theoneatom.com/",
  "description": "Akhi AI is an Intelligent AI Assistant Powered by Cutting-Edge Technology. Get instant answers, creative help, and smart solutions for your everyday tasks.",
  "image": "https://akhi.theoneatom.com/akhi_logo.png",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "ratingCount": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "The One Atom",
    "url": "https://theoneatom.com/"
  }
};

// Brand Schema
const brandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "Akhi AI",
  "slogan": "Your Brother in Faith and Knowledge",
  "logo": "https://akhi.theoneatom.com/akhi_logo.png",
  "url": "https://akhi.theoneatom.com"
};

export const metadata: Metadata = {
  metadataBase: new URL('https://akhi.theoneatom.com'),
  title: {
    default: 'Akhi AI - Islamic Guidance Assistant',
    template: '%s | Akhi AI'
  },
  description: 'Your trusted digital companion for Islamic knowledge, prayer times, and guidance.',
  keywords: ['Akhi AI', 'Akhi', 'AI Akhi', 'Ask Akhi', 'Akhi AI by The One Atom', 'Akhi AI Atom', 'Islamic AI', 'Muslim Assistant', 'Prayer Times', 'Quran', 'Hadith', 'Islamic Knowledge'],
  authors: [{ name: 'The One Atom', url: 'https://theoneatom.com' }],
  creator: 'The One Atom',
  publisher: 'The One Atom',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://akhi.theoneatom.com',
    siteName: 'Akhi AI',
    title: 'Akhi AI - Islamic Guidance Assistant',
    description: 'Your trusted digital companion for Islamic knowledge, prayer times, and guidance.',
    images: [
      {
        url: 'https://akhi.theoneatom.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Akhi AI Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akhi AI - Islamic Guidance Assistant',
    description: 'Your trusted digital companion for Islamic knowledge, prayer times, and guidance.',
    images: ['https://akhi.theoneatom.com/og-image.jpg'],
    creator: '@theoneatom',
  },
  alternates: {
    canonical: 'https://akhi.theoneatom.com',
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: '#000000',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
      </head>
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
