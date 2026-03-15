'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasAssertionError: boolean;
}

/**
 * Catches unrecoverable Firestore internal assertion errors and provides
 * a graceful recovery path for the user.
 */
export class FirestoreErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasAssertionError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Only intercept specific Firestore internal crashes
    if (error.message?.includes('INTERNAL ASSERTION FAILED')) {
      return { hasAssertionError: true };
    }
    // Let other errors bubble up to standard error boundaries
    return { hasAssertionError: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error.message?.includes('INTERNAL ASSERTION FAILED')) {
      console.error('[SpendXP] Critical Firestore assertion crash caught:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasAssertionError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-none shadow-2xl text-center p-8 overflow-hidden">
            <div className="bg-rose-500 h-2 w-full absolute top-0 left-0" />
            <div className="h-20 w-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Connection Reset</CardTitle>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Something went wrong with your secure connection to the SpendXP vault. Tap to re-establish.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full h-16 text-xl font-black rounded-2xl gap-3 shadow-xl shadow-rose-100"
            >
              <RefreshCw className="h-5 w-5" />
              Reconnect Now
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
