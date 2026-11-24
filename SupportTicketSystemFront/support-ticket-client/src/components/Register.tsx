import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' });
    const { token } = useAuthStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('http://localhost:5032/api/Auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            toast.success('Usuario creado exitosamente.');
            navigate('/users');
        } else {
            const errorData = await res.json().catch(() => null);
            toast.error(errorData?.message || 'No tienes permisos o hubo un error al crear el usuario.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
            <button
                type="button"
                onClick={toggleDarkMode}
                className="absolute top-6 right-6 text-2xl p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Alternar tema"
            >
                {isDarkMode ? '🌙' : '☀️'}
            </button>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96 transition-colors">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Crear Nuevo Usuario</h2>
                <input
                    type="text" placeholder="Nombre completo" required
                    className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="email" placeholder="Correo electrónico" required
                    className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                    type="password" placeholder="Contraseña" required
                    className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                />

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rol del usuario
                    </label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                            <input
                                type="radio"
                                name="role"
                                value="User"
                                checked={formData.role === 'User'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Usuario</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                            <input
                                type="radio"
                                name="role"
                                value="Admin"
                                checked={formData.role === 'Admin'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>Administrador</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Crear Usuario
                </button>
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    <Link to="/users" className="text-blue-600 hover:underline font-medium">
                        ← Volver a Administración de Usuarios
                    </Link>
                </p>
            </form>
        </div>
    );
}