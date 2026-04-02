


import { createContext, useContext, useState, useEffect } from "react";
import { login, register, refresh, getMe } from "@/api/auth.api";
import {
    setTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
} from "@/utils/auth";
import { decodeToken } from "@/utils/jwt";

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
    setUserFromToken: ()=>void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔁 restore session
    // useEffect(() => {
    //     const init = async () => {
    //         const access = getAccessToken();
    //         const refreshToken = getRefreshToken();

    //         if (!access || !refreshToken) {
    //             setLoading(false);
    //             return;
    //         }

    //         try {
    //             const res = await refresh(refreshToken);

    //             const { accessToken, refreshToken: newRefresh } = res.data;

    //             setTokens(accessToken, newRefresh);

    //             const decoded = decodeToken(accessToken);

    //             if (decoded) {
    //                 setUser({
    //                     id: decoded.id,
    //                     email: decoded.email,
    //                 });
    //             }
    //         } catch {
    //             clearTokens();
    //             setUser(null);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     init();
    // }, []);

    useEffect(() => {
        const access = getAccessToken();

        if (!access) {
            setLoading(false);
            return;
        }

        const decoded = decodeToken(access);

        if (!decoded) {
            clearTokens();
            setUser(null);
        } else {
            setUser({
                id: decoded.id,
                email: decoded.email,
            });
        }

        setLoading(false);
    }, []);

    const registerUser = async (data: {
        email: string;
        password: string;
    }) => {
        const res = await register(data);

        const { accessToken, refreshToken } = res.data;

        setTokens(accessToken, refreshToken);

        const decoded = decodeToken(accessToken);

        if (decoded) {
            setUser({
                id: decoded.id,
                email: decoded.email,
            });
        }
    };

    // 🔐 login
    const loginUser = async (data: { email: string; password: string }) => {
        console.log(data);
        
        const res = await login(data);

        const { accessToken, refreshToken } = res.data;

        setTokens(accessToken, refreshToken);

        const decoded = decodeToken(accessToken);

        console.log(decodeToken);
        

        if (decoded) {
            setUser({
                id: decoded.id,
                email: decoded.email,
            });

            console.log(user);
            
        }
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