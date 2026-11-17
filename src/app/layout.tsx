import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AmbientBackdrop } from '@/components/AmbientBackdrop';

export const metadata: Metadata = {
  title: 'Sentinel Mbare · Community Health Intelligence',
  description: 'Community Health Intelligence and Microplanning for a Healthier Mbare',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-[#09140d] text-white min-h-screen relative overflow-x-hidden" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AmbientBackdrop />
          <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
            {children}
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
