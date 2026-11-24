import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useTicketStore } from './store/ticketStore';
import TicketForm from './components/TicketForm';
import TicketModal from './components/TicketModal';
import DashboardStats from './components/DashboardStats';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './components/Login';
import Register from './components/Register';
import UserManagement from './components/UserManagement';
import { downloadTicketsCSV } from './utils/exportToCsv';

// 1. Guardián para las rutas protegidas (requiere sesión iniciada)
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { userId } = useAuthStore();

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 2. Guardián exclusivo para Administradores
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { userId, role } = useAuthStore();

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return role === 'Admin' ? <>{children}</> : <Navigate to="/" replace />;
};

function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { role, logout } = useAuthStore();
  const { tickets, loading, fetchTickets, openModal, currentPage, totalPages } = useTicketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getPrioridadColor = (prioridad: number) => {
    switch (prioridad) {
      case 2: return 'bg-red-100 text-red-800'; // Alta
      case 1: return 'bg-yellow-100 text-yellow-800'; // Media
      default: return 'bg-green-100 text-green-800'; // Baja
    }
  };

  const getEstadoBadge = (status: number) => {
    if (status === 2) return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resuelto</span>;
    if (status === 1) return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">En Progreso</span>;
    return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Abierto</span>;
  };

  // Lógica que filtra los tickets antes de renderizarlos
  const filteredTickets = tickets.filter(ticket => {
    // Filtro por texto (Búsqueda)
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    if (filterStatus === 'todos') return matchesSearch;
    if (filterStatus === 'abiertos') return matchesSearch && ticket.status === 0;
    if (filterStatus === 'progreso') return matchesSearch && ticket.status === 1;
    if (filterStatus === 'resueltos') return matchesSearch && ticket.status === 2;

    return matchesSearch;
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">
            Sistema de Soporte IA
          </h1>

          <div className="flex items-center gap-4">
            {role === 'Admin' && (
              <Link
                to="/users"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Administrar Usuarios
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className="text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Alternar tema"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <DashboardStats tickets={tickets} />
        {role === 'User' && <TicketForm />}
        <TicketModal />

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Buscar por problema o descripción..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('abiertos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'abiertos' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Abiertos
            </button>
            <button
              onClick={() => setFilterStatus('progreso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'progreso' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              En Progreso
            </button>
            <button
              onClick={() => setFilterStatus('resueltos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'resueltos' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Resueltos
            </button>
            {role === 'Admin' && (
              <button
                onClick={() => downloadTicketsCSV(filteredTickets)}
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">Cargando tickets...</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Turno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Problema</th>
                  {role === 'Admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría IA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} onClick={() => openModal(ticket)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.status !== 2 && ticket.queuePosition ? (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                          #{ticket.queuePosition}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          Atendido
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{ticket.description}</div>
                    </td>
                    {role === 'Admin' && (
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.user?.name || 'Desconocido'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.user?.email || ticket.userId}</div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ticket.aiCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadColor(ticket.priority)}`}>
                        {ticket.priority === 2 ? 'Alta' : ticket.priority === 1 ? 'Media' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getEstadoBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <button
                onClick={() => fetchTickets(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Página {currentPage} de {totalPages || 1}
              </span>

              <button
                onClick={() => fetchTickets(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>

            {tickets.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No hay tickets registrados en el sistema.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Exclusivas de Administrador */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AdminRoute>
              <Register />
            </AdminRoute>
          }
        />

        {/* Ruta Privada (Protegida por el Guardián) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Si intentan ir a una ruta que no existe, los mandamos al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}