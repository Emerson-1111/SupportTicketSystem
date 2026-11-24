import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUserRole, deleteUser } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { TicketUser } from '../types/ticket.types';
import toast from 'react-hot-toast';

export default function UserManagement() {
    const [users, setUsers] = useState<TicketUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId: currentUserId } = useAuthStore();
    const { isDarkMode, toggleDarkMode } = useThemeStore();

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

    const handleRoleChange = async (targetUserId: string, newRole: string) => {
        try {
            await updateUserRole(targetUserId, newRole);
            setUsers(prev =>
                prev.map(u => (u.id === targetUserId ? { ...u, role: newRole } : u))
            );
            toast.success(`Rol actualizado a ${newRole === 'Admin' ? 'Administrador' : 'Usuario'}.`);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar el rol del usuario.');
        }
    };

    const handleDeleteUser = async (targetUser: TicketUser) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${targetUser.name}" (${targetUser.email})?`)) {
            return;
        }

        try {
            await deleteUser(targetUser.id);
            setUsers(prev => prev.filter(u => u.id !== targetUser.id));
            toast.success('Usuario eliminado correctamente.');
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Error al eliminar el usuario.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Administración de Usuarios
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Gestiona las cuentas registradas, asigna roles o elimina usuarios del sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Alternar tema"
                        >
                            {isDarkMode ? '🌙' : '☀️'}
                        </button>
                        <Link
                            to="/"
                            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            ← Volver al Dashboard
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                        >
                            + Crear Nuevo Usuario
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
                        Cargando usuarios...
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Nombre / ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Correo Electrónico
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tickets Creados
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Rol Asignado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u) => {
                                    const isCurrentUser = u.id.toLowerCase() === currentUserId?.toLowerCase();

                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {u.name}
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
                                                            Tú
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 font-mono">
                                                    ID: {u.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                    {u.ticketsCount ?? 0} tickets
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role || 'User'}
                                                    disabled={isCurrentUser}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className={`text-sm font-medium rounded-lg border px-3 py-1.5 outline-none transition-colors ${
                                                        u.role === 'Admin'
                                                            ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700'
                                                            : 'bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                                                    } ${isCurrentUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <option value="User">Usuario (User)</option>
                                                    <option value="Admin">Administrador (Admin)</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isCurrentUser ? (
                                                    <span className="text-xs text-gray-400 italic">
                                                        Sesión actual
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-semibold hover:bg-red-200 transition-colors"
                                                    >
                                                        Eliminar Usuario
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No hay usuarios registrados en el sistema.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

