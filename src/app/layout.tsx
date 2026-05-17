import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Checkers — Шашки онлайн',
  description: 'Современная платформа для игры в шашки. Играйте против AI или с друзьями онлайн.',
  keywords: ['шашки', 'checkers', 'онлайн', 'мультиплеер', 'AI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
