import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary ловит ошибки отрисовки и показывает понятное сообщение вместо белого экрана
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
           minHeight: '100vh', 
           display: 'flex', 
           alignItems: 'center', 
           justifyContent: 'center', 
           backgroundColor: '#FEF2F2',
           fontFamily: 'ui-sans-serif, system-ui, sans-serif'
        }}>
          <div style={{
             background: 'white',
             padding: '2rem',
             borderRadius: '0.75rem',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
             maxWidth: '42rem',
             width: '100%',
             border: '1px solid #FECACA'
          }}>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626', marginBottom: '1rem'}}>
              Что-то пошло не так
            </h1>
            <p style={{color: '#4B5563', marginBottom: '1rem'}}>
              Произошла ошибка в работе приложения. Попробуйте перезагрузить страницу.
            </p>
            <pre style={{
               background: '#F3F4F6',
               padding: '1rem',
               borderRadius: '0.5rem',
               overflow: 'auto',
               fontSize: '0.75rem',
               color: '#374151',
               border: '1px solid #E5E7EB',
               marginBottom: '1.5rem'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                 padding: '0.75rem 1.5rem',
                 backgroundColor: '#0F172A',
                 color: 'white',
                 borderRadius: '0.5rem',
                 border: 'none',
                 cursor: 'pointer',
                 fontWeight: 'bold'
              }}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);