import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gemini AI Clone - Your AI Conversation Hub',
  description: 'A fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application.',
  keywords: 'AI, Chat, Gemini, Next.js, React, Conversational AI',
  authors: [{ name: 'Gemini AI Clone Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
