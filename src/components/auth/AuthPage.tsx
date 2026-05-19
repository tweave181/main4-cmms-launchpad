import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import EmailVerificationPending from './EmailVerificationPending';
import InvitationCodeDialog from './InvitationCodeDialog';
import CreateAccountDialog from './CreateAccountDialog';
import main4Branding from '@/assets/main4-branding.jpeg';

type AuthView = 'login' | 'verification-pending';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [validatedCode, setValidatedCode] = useState<string>('');
  const location = useLocation();

  const [msg, setMsg] = useState<string | null>(null);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const q = searchParams;
    const expiredFromQuery = q.get('expired');
    const expiredFromStorage =
      typeof window !== 'undefined' && window.sessionStorage.getItem('lovableSessionExpired') === '1';

    if (expiredFromQuery || expiredFromStorage) {
      setMsg('Your session expired. Please sign in again.');
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('lovableSessionExpired');
      }
    } else {
      setMsg(null);
    }
  }, [searchParams]);

  const handleStartSignup = () => {
    setCodeDialogOpen(true);
  };

  const handleCodeValidated = (code: string) => {
    setValidatedCode(code);
    setCodeDialogOpen(false);
    setAccountDialogOpen(true);
  };

  const handleRegistrationComplete = (email: string) => {
    setAccountDialogOpen(false);
    setValidatedCode('');
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
      <div className="flex items-center justify-center bg-background p-4 py-[30px] px-px">
        <div className="w-full max-w-md border-2 border-solid py-0">
          {msg && view === 'login' && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded py-2 px-3 text-amber-700 text-sm text-center">
              {msg}
            </div>
          )}
          {view === 'login' && <LoginForm onToggleMode={handleStartSignup} />}
          {view === 'verification-pending' && (
            <EmailVerificationPending email={pendingEmail} onBackToLogin={handleBackToLogin} />
          )}
        </div>
      </div>

      <InvitationCodeDialog
        open={codeDialogOpen}
        onOpenChange={setCodeDialogOpen}
        onValidated={handleCodeValidated}
      />
      <CreateAccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        invitationCode={validatedCode}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default AuthPage;
