import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-battle-darker">
          <div className="glass p-8 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              The app encountered an error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
