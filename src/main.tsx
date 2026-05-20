import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
};

const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const RootApp = lazy(async () => {
  const [{ default: App }, { AuthProvider }] = await Promise.all([
    import('./App.tsx'),
    import('./contexts/auth'),
  ]);

  return {
    default: function RootAppWithProviders() {
      return (
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      );
    },
  };
});

function MissingEnvScreen({ vars }: { vars: string[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <div className="border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-destructive">Startup configuration error</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Required backend variables are missing</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This build cannot start because the published frontend is missing required configuration.
            Check the project environment values, then republish the app.
          </p>

          <div className="mt-6 border border-border bg-muted p-4">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Missing variables</p>
            <ul className="mt-3 space-y-2">
              {vars.map((name) => (
                <li key={name}>
                  <code className="text-sm font-medium text-foreground">{name}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

document.documentElement.setAttribute('data-app-build', '2026-05-20-production-env-guard');

const root = createRoot(document.getElementById('root')!);

if (missingEnvVars.length > 0) {
  root.render(<MissingEnvScreen vars={missingEnvVars} />);
} else {
  root.render(
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
          Loading application…
        </div>
      }
    >
      <RootApp />
    </Suspense>
  );
}
