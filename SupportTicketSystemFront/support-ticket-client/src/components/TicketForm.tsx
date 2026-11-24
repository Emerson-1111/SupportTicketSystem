import { useState } from 'react';
import { createTicket } from '../services/api';
import { useTicketStore } from '../store/ticketStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function TicketForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fetchTickets = useTicketStore((state) => state.fetchTickets);
    const { userId } = useAuthStore();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            toast.error('Debes iniciar sesión para crear un ticket.');
            return;
        }
        setIsSubmitting(true);

        try {
            await createTicket({
                title,
                description,
                userId
            });
            setTitle('');
            setDescription('');
            await fetchTickets();
            toast.success('¡Ticket creado y clasificado por la IA!');
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al crear el ticket.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Crear Nuevo Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título del problema</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: La pantalla no enciende"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción detallada</label>
                    <textarea
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el problema con el mayor detalle posible para que nuestra IA pueda clasificarlo."
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {isSubmitting ? 'Enviando y analizando con IA...' : 'Enviar Ticket'}
                </button>
            </form>
        </div>
    );
}