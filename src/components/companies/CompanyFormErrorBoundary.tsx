import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class CompanyFormErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CompanyFormErrorBoundary caught an error:", error, errorInfo);
    
    // In development, show more detailed error information
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detailed error info:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Company Form Error
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Something went wrong with the company form.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="text-xs bg-background p-2 rounded border">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}