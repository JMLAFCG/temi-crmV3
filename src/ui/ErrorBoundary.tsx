import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import SafeLink from './SafeLink';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">Une erreur est survenue</h1>

              <p className="text-gray-600 mb-8">
                L'application a rencontré une erreur inattendue. Veuillez réessayer ou retourner au
                tableau de bord.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Détails de l'erreur (développement)
                  </h3>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<RefreshCw size={16} />}
                  onClick={this.handleReload}
                >
                  Recharger la page
                </Button>

                <SafeLink route="dashboard">
                  <Button variant="outline" fullWidth leftIcon={<Home size={16} />}>
                    Retour au tableau de bord
                  </Button>
                </SafeLink>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
