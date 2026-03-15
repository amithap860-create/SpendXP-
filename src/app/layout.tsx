import type {Metadata} from 'next';
import './globals.css';
import { UserProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGroupProvider } from '@/lib/ageAdapt';
import { AuthProvider } from '@/context/AuthContext';
import { FirestoreErrorBoundary } from '@/components/FirestoreErrorBoundary';
import { validateEnv } from '@/lib/envValidation';
import { ConsoleGuard } from '@/components/ConsoleGuard';

validateEnv();

export const metadata: Metadata = {
  title: 'SpendXP - Gamified Financial Literacy',
  description: 'Learn to master your money through interactive games and age-adapted lessons.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AgeGroupProvider>
            <AuthProvider>
              <FirestoreErrorBoundary>
                <UserProvider>
                  <ConsoleGuard />
                  {children}
                  <Toaster />
                </UserProvider>
              </FirestoreErrorBoundary>
            </AuthProvider>
          </AgeGroupProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
