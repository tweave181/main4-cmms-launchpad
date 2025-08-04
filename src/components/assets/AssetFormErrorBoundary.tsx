
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AssetFormErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface AssetFormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AssetFormErrorBoundary extends React.Component<
  AssetFormErrorBoundaryProps,
  AssetFormErrorBoundaryState
> {
  constructor(props: AssetFormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AssetFormErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AssetFormErrorBoundary caught an error:', {
      error,
      errorInfo,
      stack: error.stack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Something went wrong with the asset form</p>
                <p className="text-sm">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-start space-x-2">
            <Button variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
