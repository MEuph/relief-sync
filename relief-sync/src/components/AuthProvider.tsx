'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  creds: any | null;
  setCreds: (creds: any | null) => void;
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
  const [creds, setCredsState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('dbCreds');
    if (saved) {
      setCredsState(JSON.parse(saved));
    }
    setLoading(false); // Hydration complete
  }, []);

  const setCreds = (c: any | null) => {
    if (c) {
      localStorage.setItem('dbCreds', JSON.stringify(c));
    } else {
      localStorage.removeItem('dbCreds');
    }
    setCredsState(c);
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
