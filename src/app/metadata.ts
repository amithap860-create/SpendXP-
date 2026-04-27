import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SpendXP — Financial Literacy for Future Pros',
    template: '%s | SpendXP',
  },
  description: 'Learn money management through games, quests and tools. Built for ages 8–20.',
  applicationName: 'SpendXP',
  keywords: ['financial literacy', 'money', 'games', 'kids', 'teens', 'budgeting', 'investing'],
  authors: [{ name: 'SpendXP' }],
  creator: 'SpendXP',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://spendxp.vercel.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://spendxp.vercel.app',
    siteName: 'SpendXP',
    title: 'SpendXP — Financial Literacy for Future Pros',
    description: 'Learn money management through games, quests and tools. Built for ages 8–20.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendXP',
    description: 'Financial literacy for ages 8–20',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpendXP',
  },
  themeColor: '#1A1F2E',
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
