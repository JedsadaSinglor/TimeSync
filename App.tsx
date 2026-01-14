
import React, { ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AlertTriangle } from 'lucide-react';

// Static imports to ensure reliable loading
import Dashboard from './pages/Dashboard';
import Timesheet from './pages/Timesheet';
import CategoryManagement from './pages/Admin';
import Help from './pages/Help';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4 text-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border-4 border-red-50 dark:border-red-900/30">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
              The application encountered an unexpected error and could not load.
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl text-xs font-mono text-left text-slate-600 dark:text-slate-300 overflow-auto max-h-32 mb-6 border border-slate-200 dark:border-slate-800">
              {this.state.error?.message || "Unknown Error"}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
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

// Main App Layout Wrapper
const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <ThemeProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </ThemeProvider>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
