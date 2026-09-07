import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Hind_Siliguri } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bn',
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen bg-white text-ink-900 font-sans antialiased">{children}</body>
    </html>
  );
}
