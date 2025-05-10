'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  creds: {
    username: string;
    password: string;
    role: string;
  } | null;
  setCreds: (creds: AuthContextType['creds']) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  creds: null,
  setCreds: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [creds, setCredsState] = useState<AuthContextType['creds']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dbCreds');
    if (saved) {
      setCredsState(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const setCreds = (creds: AuthContextType['creds']) => {
    if (creds) {
      localStorage.setItem('dbCreds', JSON.stringify(creds));
    } else {
      localStorage.removeItem('dbCreds');
    }
    setCredsState(creds);
  };

  const logout = () => {
    localStorage.removeItem('dbCreds');
    setCredsState(null);
  };

  return (
    <AuthContext.Provider value={{ creds, setCreds, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
