'use client';

import React, { Component, ReactNode } from 'react';
import { resetFirestore } from '@/lib/firebase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isFirestoreError: boolean;
}

/**
 * Catches unrecoverable Firestore internal assertion errors and provides
 * a graceful recovery path. When an INTERNAL ASSERTION FAILED (ca9/b815)
 * error is detected, it terminates and reinitialises the Firestore instance,
 * then attempts a soft recovery. If the soft recovery fails it falls back to
 * a full page reload.
 */
export class FirestoreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isFirestoreError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isFirestoreError =
      error.message?.includes('INTERNAL ASSERTION FAILED') ||
      error.message?.includes('FIRESTORE') ||
      error.message?.includes('permission-denied') ||
      error.message?.includes('ca9') ||
      error.message?.includes('b815');
    return { hasError: true, isFirestoreError };
  }

  componentDidCatch(error: Error) {
    console.error(
      '[SpendXP] FirestoreErrorBoundary caught:',
      error.message
    );

    if (
      error.message?.includes('INTERNAL ASSERTION FAILED') ||
      error.message?.includes('ca9') ||
      error.message?.includes('b815')
    ) {
      console.warn(
        '[SpendXP] Firestore internal crash detected.',
        'Reinitialising in 2 seconds...'
      );
      setTimeout(async () => {
        try {
          await resetFirestore();
          this.setState({ hasError: false });
        } catch (e) {
          console.error(
            '[SpendXP] Firestore reinit failed:',
            e
          );
          window.location.reload();
        }
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <p
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1e293b',
            }}
          >
            {this.state.isFirestoreError
              ? 'Connection issue detected. Please refresh.'
              : 'Something went wrong.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            suppressHydrationWarning
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2e72db',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              minHeight: '44px',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
