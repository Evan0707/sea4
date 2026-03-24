import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-8">
          <div className="bg-red/5 border border-red/20 rounded-[var(--radius-lg)] p-8 text-center max-w-md w-full">
            <p className="text-2xl font-bold text-red mb-2">Une erreur inattendue est survenue</p>
            <p className="text-sm text-text-secondary mb-6">
              {this.state.message || "L'application a rencontré un problème. Veuillez recharger la page."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
