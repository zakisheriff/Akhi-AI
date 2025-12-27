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
  "description": "Akhi AI is an Intelligent AI assistant powered by cutting-edge technology. Get instant answers, creative help, and smart solutions for your everyday tasks.",
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

  title: "Akhi AI",
  description: "Akhi AI is an intelligent AI assistant powered by cutting-edge technology. Get instant answers, creative help, and smart solutions for your everyday tasks.",
  keywords: "Akhi AI, Ask Akhi, Islam Chatbot, Muslim AI, Akhi AI, Akhi, AI helper, conversational AI",
  authors: [{ name: "The One Atom" }],
  openGraph: {
    title: "Akhi AI",
    description: "Akhi AI is an intelligent AI assistant powered by cutting-edge technology. Get instant answers, creative help, and smart solutions for your everyday tasks.",
    url: "https://akhi.theoneatom.com",
    siteName: "Akhi AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/akhi_logo.png",
        width: 1200,
        height: 630,
        alt: "Akhi AI - Your Intelligent AI Companion"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@akhiai",
    title: "Akhi AI – Intelligent AI Assistant for Your Daily Needs",
    description: "Get instant answers, creative help, and smart solutions for your everyday tasks.",
    images: ["/akhi_logo.png"]
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
