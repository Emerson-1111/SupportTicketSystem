import { create } from 'zustand';

interface ThemeState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

// Revisamos si el usuario ya tenía el modo oscuro guardado previamente
const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('theme') === 'dark';
    }
    return false;
};

export const useThemeStore = create<ThemeState>((set) => ({
    isDarkMode: getInitialTheme(),
    toggleDarkMode: () => set((state) => {
        const newTheme = !state.isDarkMode;
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');

        if (newTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return { isDarkMode: newTheme };
    }),
}));