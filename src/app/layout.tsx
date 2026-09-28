import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Footy Grid Quiz',
  description: 'Gioco e quiz sulle carriere dei calciatori',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
