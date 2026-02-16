import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LesGo - Cari Guru Les Private Terdekat',
  description: 'Platform marketplace les private Indonesia. Temukan guru les terdekat berdasarkan lokasi dan mata pelajaran. Belajar lebih efektif dengan tutor privat terverifikasi.',
  keywords: 'les private, guru les, tutor, bimbel, belajar, matematika, fisika, kimia, bahasa inggris',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'LesGo' },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    title: 'LesGo - Cari Guru Les Private Terdekat',
    description: 'Platform marketplace les private Indonesia. Temukan guru les terdekat berdasarkan lokasi dan mata pelajaran.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4F46E5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
