import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
    id: number;
    email: string;
    full_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, fullName: string, password: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // On mount, try to restore session from stored token
    useEffect(() => {
        const restore = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const userData = await authApi.me();
                setUser(userData);
            } catch {
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };
        restore();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        localStorage.setItem('token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
    };

    const signup = async (email: string, fullName: string, password: string) => {
        const res = await authApi.signup({ email, full_name: fullName, password });
        localStorage.setItem('token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
    };

    const googleLogin = async (credential: string) => {
        const res = await authApi.googleLogin({ token: credential });
        localStorage.setItem('token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
