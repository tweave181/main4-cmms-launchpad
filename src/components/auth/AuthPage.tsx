
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  // Pull expired-session message from URL
  const [msg, setMsg] = React.useState<string | null>(null);
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("expired")) {
      setMsg("Your session expired. Please sign in again.");
    }
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {msg && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded py-2 px-3 text-amber-700 text-sm text-center">
            {msg}
          </div>
        )}
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
