


import { createContext, useContext, useState, useEffect } from "react";
import { login, register, getMe } from "@/api/auth.api";
import {
    setTokens,
    getAccessToken,
    clearTokens,
} from "@/utils/auth";

type User = {
    id: string;
    email: string;
    username?: string;
    img?: string;
};

type SessionStatus =
  | "idle"
  | "checking"
  | "expired"
  | "refreshing"
  | "authenticated"
  | "failed";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    loginUser: (data: { email: string; password: string }) => Promise<void>;
    registerUser: (data: { email: string; password: string }) => Promise<void>;
    logoutUser: () => void;
    setUserFromToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");


    useEffect(() => {
        const init = async () => {
            const access = getAccessToken();

            if (!access) {
                setLoading(false);
                return;
            }

            try {
                const res = await getMe();
                setUser(res.data.data);
            } catch (err: any) {
                console.log(err);

                // Let axios handle refresh first
                // Only logout if request STILL fails after retry
                if (err.response?.status === 401) {
                    clearTokens();
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);



    const registerUser = async (data: {
        email: string;
        password: string;
    }) => {
        const res = await register(data);

        const { accessToken, refreshToken } = res.data;

        setTokens(accessToken, refreshToken);

        await setUserFromToken();
    };

    // 🔐 login
    const loginUser = async (data: { email: string; password: string }) => {

        const res = await login(data);

        const { accessToken, refreshToken } = res.data;

        setTokens(accessToken, refreshToken);

        await setUserFromToken();
    };

    // 🚪 logout
    const logoutUser = () => {
        clearTokens();
        setUser(null);
    };

    const setUserFromToken = async () => {
        try {
            const res = await getMe();
            setUser(res.data.data);
        } catch {
            clearTokens();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, loginUser, registerUser, logoutUser, setUserFromToken }}
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