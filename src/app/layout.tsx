import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Owner Prospecting Dashboard | Seeto Realty',
  description: 'Private operations dashboard for Seeto Realty owner prospecting.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
