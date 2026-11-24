import type { Ticket } from '../types/ticket.types';

export default function DashboardStats({ tickets }: { tickets: Ticket[] }) {
  const abiertos = tickets.filter(t => t.status === 0).length;
  const enProgreso = tickets.filter(t => t.status === 1).length;
  const resueltos = tickets.filter(t => t.status === 2).length;
  // Calculamos los tickets de alta prioridad que aún no están resueltos
  const urgentes = tickets.filter(t => t.priority === 2 && t.status !== 2).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Abiertos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{abiertos}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">En Progreso</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{enProgreso}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resueltos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{resueltos}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/50 flex items-center justify-between hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-red-500 dark:text-red-400 mb-1">Urgentes Pendientes</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{urgentes}</p>
        </div>
      </div>
    </div>
  );
}