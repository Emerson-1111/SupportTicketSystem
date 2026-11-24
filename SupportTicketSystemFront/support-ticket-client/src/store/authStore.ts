import { create } from 'zustand';

interface AuthState {
    token: string | null;
    userId: string | null;
    role: string | null; // Nuevo campo
    login: (token: string, userId: string, role: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    role: localStorage.getItem('role'),
    login: (token, userId, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        set({ token, userId, role });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        set({ token: null, userId: null, role: null });
    }
}));