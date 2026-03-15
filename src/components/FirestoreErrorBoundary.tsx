'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isFirestoreError: boolean;
}

/**
 * Catches unrecoverable Firestore internal assertion errors and provides
 * a graceful recovery path for the user.
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
      error.message?.includes('permission-denied');
    return { hasError: true, isFirestoreError };
  }

  componentDidCatch(error: Error) {
    console.error('[SpendXP] Caught by FirestoreErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh', // Fix 3: dvh for dynamic viewport
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
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
              minHeight: '44px' // Fix 9: Tap target
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
