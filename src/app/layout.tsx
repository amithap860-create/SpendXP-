import type {Metadata} from 'next';
import './globals.css';
import { UserProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGroupProvider } from '@/lib/ageAdapt';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'SpendXP - Financial Literacy for Future Pros',
  description: 'Gamified financial learning for kids and teens.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthProvider>
            <UserProvider>
              <AgeGroupProvider>
                {children}
                <Toaster />
              </AgeGroupProvider>
            </UserProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
