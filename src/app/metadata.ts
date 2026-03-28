import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpendXP',
  description: 'Personal Finance Dashboard',
  applicationName: 'SpendXP',
  referrer: 'origin-when-cross-origin',
  keywords: ['finance', 'dashboard', 'spending', 'budget', 'SpendXP'],
  authors: [{ name: 'SpendXP Team' }],
  creator: 'SpendXP Team',
  publisher: 'SpendXP',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'),
  openGraph: {
    title: 'SpendXP',
    description: 'Personal Finance Dashboard',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
    siteName: 'SpendXP',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendXP',
    description: 'Personal Finance Dashboard',
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
