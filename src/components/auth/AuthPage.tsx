import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import EmailVerificationPending from './EmailVerificationPending';
import main4Branding from '@/assets/main4-branding.jpeg';

type AuthView = 'login' | 'register' | 'verification-pending';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  
  // Pull expired-session message from URL
  const [msg, setMsg] = React.useState<string | null>(null);
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("expired")) {
      setMsg("Your session expired. Please sign in again.");
    }
  }, []);

  const handleToggleMode = () => {
    setView(view === 'login' ? 'register' : 'login');
  };

  const handleRegistrationComplete = (email: string) => {
    setPendingEmail(email);
    setView('verification-pending');
  };

  const handleBackToLogin = () => {
    setView('login');
    setPendingEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 p-4 lg:p-8 bg-background">
      {/* Branding Image Section */}
      <div className="hidden lg:block">
        <img 
          src={main4Branding} 
          alt="Main4 - CMMS Software Developed by Engineers for Engineers"
          className="max-h-[500px] w-auto object-contain rounded-lg"
        />
      </div>
      
      {/* Form Section */}
      <div className="flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {msg && view === 'login' && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded py-2 px-3 text-amber-700 text-sm text-center">
              {msg}
            </div>
          )}
          {view === 'login' && (
            <LoginForm onToggleMode={handleToggleMode} />
          )}
          {view === 'register' && (
            <RegisterForm 
              onToggleMode={handleToggleMode} 
              onRegistrationComplete={handleRegistrationComplete}
            />
          )}
          {view === 'verification-pending' && (
            <EmailVerificationPending 
              email={pendingEmail}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
