import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('prueba@test.com');
    const [password, setPassword] = useState('admin123');
    const login = useAuthStore((state) => state.login);
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5032/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error();

            const data = await response.json();
            login(data.token, data.userId, data.role);
            toast.success('Sesión iniciada');
            navigate('/');
        } catch {
            toast.error('Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
            <button
                type="button"
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 text-2xl p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Alternar tema"
            >
                {isDarkMode ? '🌙' : '☀️'}
            </button>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96 transition-colors">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Soporte IA</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}