import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '1rem',
              border: '1px solid red',
              borderRadius: '4px',
              backgroundColor: '#fee',
            }}
          >
            <h2>Ops! Algo deu errado neste componente.</h2>
            <p>Verifique o console para mais detalhes.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
