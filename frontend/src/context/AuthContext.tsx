import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { clearStoredToken, getStoredToken, setStoredToken } from "../lib/api";
import { loginRequest, meRequest, registerRequest } from "../services/authService";
import type { User } from "../types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    meRequest()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    setStoredToken(response.token);
    setUser(response.user);
  }

  async function register(name: string, email: string, password: string) {
    const response = await registerRequest(name, email, password);
    setStoredToken(response.token);
    setUser(response.user);
  }

  function logout() {
    clearStoredToken();
    setUser(null);
  }

  async function refreshProfile() {
    const profile = await meRequest();
    setUser(profile);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
