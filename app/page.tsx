import type { Metadata } from 'next';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://akhi.theoneatom.com/',
  },
};

export default function Home() {
  return <HomeContent />;
}
