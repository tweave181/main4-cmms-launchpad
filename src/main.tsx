import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/contexts/auth';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

document.documentElement.setAttribute('data-app-build', '2026-05-20-blank-screen-refresh');

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
