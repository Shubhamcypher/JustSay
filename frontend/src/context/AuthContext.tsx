import { createContext, useContext, useState, useEffect } from "react";
import { login, register, refresh } from "@/api/auth.api";
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/utils/auth";

type User = {
  id?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginUser: (data: { email: string; password: string }) => Promise<void>;
  registerUser: (data: { email: string; password: string }) => Promise<void>;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 restore session
  useEffect(() => {
    const init = async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await refresh(refreshToken);

        setTokens(res.data.accessToken, res.data.refreshToken);

        // optional: decode or fetch user
        setUser({}); 
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🔐 login
  const loginUser = async (data: { email: string; password: string }) => {
    const res = await login(data);

    setTokens(res.data.accessToken, res.data.refreshToken);

    setUser({});
  };

  // 🆕 register
  const registerUser = async (data: {
    email: string;
    password: string;
  }) => {
    const res = await register(data);

    setTokens(res.data.accessToken, res.data.refreshToken);

    setUser({});
  };

  // 🚪 logout
  const logoutUser = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, registerUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside provider");
  return ctx;
}