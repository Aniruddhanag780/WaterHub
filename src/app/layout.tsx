import type {Metadata} from 'next';
import './globals.css';
import { HydrationProvider } from '@/lib/store';
import { Navigation } from '@/components/Navigation';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'WaterHub - Smart Hydration Tracker',
  description: 'Track your daily water intake with intelligent reminders and visualizations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen pb-20 md:pb-0">
        <FirebaseClientProvider>
          <HydrationProvider>
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <Navigation />
              <main className="py-6">
                {children}
              </main>
            </div>
            <Toaster />
          </HydrationProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
