'use client';

import { Component, ReactNode } from 'react';

interface Props {
  sectionName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates runtime crashes to a specific profile section.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[SpendXP] ${this.props.sectionName} crashed:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-3">
          <p className="text-sm font-bold text-slate-600">
            {this.props.sectionName} failed to load.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            suppressHydrationWarning
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
          >
            Retry Section
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
