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
  keywords: "Islamic AI, Muslim AI, Quran AI, Hadith, halal, prayer times, fiqh, Islamic questions, Islamic chatbot",
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
        url: "/akhi-ai-share.png",
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
    images: ["/akhi-ai-share.png"]
  },
  icons: {
    icon: "/favicon.png",
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
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
