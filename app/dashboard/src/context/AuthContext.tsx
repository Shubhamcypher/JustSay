
import { createContext, useContext, useState, useEffect } from "react";
import { login, register, getMe, logout } from "@/api/auth.api";
import { authStore } from "@/authStore";
import { hideBootScreen } from "@/utils/boot";
import type { ReactNode } from "react";
import type { SessionStatus } from "@shared/types";

type User = {
    id: string;
    email: string;
    username?: string;
    img?: string;
};



type AuthContextType = {
    user: User | null;
    loading: boolean;
    sessionStatus: SessionStatus;
    loginUser: (data: { email: string; password: string }) => Promise<void>;
    registerUser: (data: { email: string; password: string }) => Promise<void>;
    logoutUser: () => void;
    setUserFromToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);


interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");

    useEffect(() => {
        authStore.setSessionSetter(setSessionStatus);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                setSessionStatus("checking");

                const res = await getMe(); // interceptor handles refresh

                setUser(res.data.data);

                setSessionStatus("authenticated");
            } catch {
                setUser(null);
                setSessionStatus("failed");

            } finally {
                setLoading(false);
                hideBootScreen()
            }
        };

        init();
    }, []);



    const registerUser = async (data: {
        email: string;
        password: string;
    }) => {
        await register(data);

        await setUserFromToken();
    };

    // 🔐 login
    const loginUser = async (data: { email: string; password: string }) => {

        await login(data);
        await setUserFromToken();
    };

    // 🚪 logout
    const logoutUser = async () => {
        try {
            await logout();
        } finally {
            setUser(null);
            setSessionStatus("failed");
        }
    };

    const setUserFromToken = async () => {
        try {
            const res = await getMe();
            setUser(res.data.data);
        } catch {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, sessionStatus, loginUser, registerUser, logoutUser, setUserFromToken }}
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