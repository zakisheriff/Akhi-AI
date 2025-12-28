import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
  title: 'Akhi AI',
  description: 'Akhi AI is an intelligent AI assistant powered by cutting-edge technology. Get instant answers, creative help, and smart solutions for your everyday tasks. Chat with AI that understands you.',
  alternates: {
    canonical: 'https://akhiai.theoneatom.com/',
  },
};

// WebPage JSON-LD Schema
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Akhi AI",
  "description": "Akhi AI is an intelligent AI assistant powered by cutting-edge technology. Get instant answers, creative help, and smart solutions for your everyday tasks.",
  "url": "https://akhiai.theoneatom.com/",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Akhi AI",
    "url": "https://akhiai.theoneatom.com"
  }
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <HomeContent />
    </>
  );
}
