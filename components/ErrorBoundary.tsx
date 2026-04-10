import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred';
      let isFirestoreError = false;

      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.operationType) {
          isFirestoreError = true;
          errorMessage = parsed.error;
        }
      } catch (e) {
        // Not a JSON string, ignore
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-3xl text-rose-500 mb-6">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isFirestoreError 
                ? "There was a problem communicating with the database. Please check your permissions or try signing in again."
                : "The application encountered an unexpected error."}
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl mb-6 overflow-x-auto">
              <code className="text-xs text-rose-600 dark:text-rose-400 font-mono whitespace-pre-wrap break-words">
                {errorMessage}
              </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
