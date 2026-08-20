import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Transaction Reconciliation Dashboard | O(N) HashMap Engine',
  description:
    'High-performance full stack transaction reconciliation dashboard built with Next.js App Router and TypeScript. Categorize bank vs merchant transactions into Matched, Amount Mismatch, Date Mismatch, and missing entries in O(N) linear time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
