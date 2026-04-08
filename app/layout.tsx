import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alam Daan | Infrastructure Intelligence System',
  description: 'Nationwide Infrastructure Decay Detection & Priority Mapping System for the Republic of the Philippines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0d1b2a] text-white">
        {children}
      </body>
    </html>
  );
}
