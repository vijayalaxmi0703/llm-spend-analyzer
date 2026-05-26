import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  preload: true
});

export const metadata: Metadata = {
  title: 'Credex Audit | AI Spend Optimization for Startups',
  description: 'Audit AI subscriptions, uncover waste, and discover savings with Credex Audit — the founder-focused AI spend optimization platform.',
  metadataBase: new URL('https://credex-audit.example.com'),
  openGraph: {
    title: 'Credex Audit',
    description: 'AI spend audits for founders. Fast, finance-defensible recommendations and shareable reports.',
    type: 'website',
    siteName: 'Credex Audit',
    images: ['/og-image.svg']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credex Audit',
    description: 'AI spend audits for founders. Fast, finance-defensible recommendations and shareable reports.',
    images: ['/og-image.svg']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen bg-primary-bg text-text-primary`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
