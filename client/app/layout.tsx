import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legal Contract Analyzer | AI Contract Intelligence & Citation Verification',
  description:
    'Enterprise legal contract analysis web application with deterministic citation verification, cross-contract comparison, and agentic document research.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full dark`} suppressHydrationWarning>
      <body className="h-full bg-slate-950 text-slate-100 overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
