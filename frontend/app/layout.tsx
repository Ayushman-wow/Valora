import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import clsx from 'clsx';

import FloatingHearts from '@/components/FloatingHearts';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Valora | Valentine\'s Week Experience',
  description: 'Connect, Confess, and Celebrate Love with Valora.',
  metadataBase: new URL('https://heartsync.app'),
};

import Providers from './providers';
import GlobalNotifications from '@/components/GlobalNotifications';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body className={clsx(outfit.className, "antialiased min-h-screen relative overflow-x-hidden selection:bg-love-rose/30 selection:text-love-crimson")}>
        <Providers>
          <FloatingHearts />
          <GlobalNotifications />
          <Navbar />
          <main className="pt-20 pb-4 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
            {children}
          </main>
          <footer className="w-full py-6 text-center text-love-charcoal/60 border-t border-love-rose/10 bg-white/40 backdrop-blur-sm">
            <p>© {new Date().getFullYear()} Valora. Made with ❤️ for Valentine's Week.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
