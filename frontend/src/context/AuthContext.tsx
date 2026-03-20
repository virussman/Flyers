import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { api } from '@/api/client';

interface User {
  id: number;
  phone: string;
  name: string;
  email?: string;
  role: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  _version: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {},
  isLoading: true, isLoggedIn: false,
  _version: 0,
});

function saveToken(token: string) {
  try { localStorage.setItem('flyers_token', token); } catch (_) {}
  try { sessionStorage.setItem('flyers_token', token); } catch (_) {}
  document.cookie = `flyers_token=${token};path=/;max-age=2592000;SameSite=Lax`;
}

function getToken(): string | null {
  try { const t = localStorage.getItem('flyers_token'); if (t) return t; } catch (_) {}
  try { const t = sessionStorage.getItem('flyers_token'); if (t) return t; } catch (_) {}
  const match = document.cookie.match(/(?:^|; )flyers_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clearToken() {
  try { localStorage.removeItem('flyers_token'); } catch (_) {}
  try { sessionStorage.removeItem('flyers_token'); } catch (_) {}
  document.cookie = 'flyers_token=;path=/;max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const savedToken = getToken();
    if (savedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      api.get('/auth/me')
        .then(res => { 
          setUser({ ...res.data }); 
          setToken(savedToken);
          setVersion(v => v + 1);
        })
        .catch(() => { clearToken(); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    saveToken(newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser({ ...newUser });
    setVersion(v => v + 1);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setVersion(v => v + 1);
  }, []);

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isLoggedIn: !!user,
    _version: version,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);