import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'VANTIQ - Intelligence That Converts',
  description: 'AI-powered lead generation, CRM, and business intelligence platform. Generate 1000+ qualified leads daily.',
  keywords: ['leads', 'CRM', 'AI', 'business intelligence', 'lead generation', 'intelligence'],
  authors: [{ name: 'VANTIQ' }],
  openGraph: {
    title: 'VANTIQ - Intelligence That Converts',
    description: 'AI-powered lead generation platform',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  themeColor: '#101827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
        </head>
        <body className="bg-vantiq-navy text-vantiq-ivory antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
