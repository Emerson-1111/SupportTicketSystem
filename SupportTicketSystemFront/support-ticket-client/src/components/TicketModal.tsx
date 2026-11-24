import { useState } from 'react';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { addTicketComment } from '../services/api';
import toast from 'react-hot-toast';

export default function TicketModal() {
    const { isModalOpen, selectedTicket, closeModal, comments, loadingComments, fetchComments, updateStatus } = useTicketStore();
    const { userId, role } = useAuthStore();
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    if (!isModalOpen || !selectedTicket) return null;

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userId) return;

        setSending(true);
        try {
            await addTicketComment(selectedTicket.id, {
                ticketId: selectedTicket.id,
                userId,
                text: newComment
            });
            setNewComment('');
            await fetchComments(selectedTicket.id);
            toast.success('Respuesta enviada');
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar comentario');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh] transition-colors">

                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-2xl">
                    &times;
                </button>

                <div className="p-6 md:p-8 overflow-y-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-2 pr-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTicket.title}</h2>
                        {selectedTicket.status !== 2 && selectedTicket.queuePosition && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                Turno en cola: #{selectedTicket.queuePosition}
                            </span>
                        )}
                    </div>

                    {role === 'Admin' && selectedTicket.user && (
                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2">
                            <span className="font-semibold text-gray-800 dark:text-white">Reportado por:</span>{' '}
                            {selectedTicket.user.name} ({selectedTicket.user.email})
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Descripción original</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                            {selectedTicket.description}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comentarios</h3>

                        <div className="space-y-4 mb-6">
                            {loadingComments ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cargando comentarios...</p>
                            ) : comments.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay comentarios aún.</p>
                            ) : (
                                comments.map(comment => {
                                    const isOwnMessage = comment.userId?.toLowerCase() === userId?.toLowerCase();
                                    const senderRoleLabel = comment.user?.role === 'Admin' ? 'Admin' : 'Usuario';
                                    const senderName = isOwnMessage
                                        ? `Tú (${senderRoleLabel})`
                                        : `${comment.user?.name || 'Usuario'} (${senderRoleLabel})`;

                                    return (
                                        <div
                                            key={comment.id}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`p-3 rounded-lg border max-w-[75%] ${
                                                    isOwnMessage
                                                        ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700 text-right'
                                                        : 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700 text-left'
                                                }`}
                                            >
                                                <span
                                                    className={`text-xs font-bold mb-1 block ${
                                                        isOwnMessage ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                                                    }`}
                                                >
                                                    {senderName}
                                                </span>
                                                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{comment.text}</p>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="mt-4">
                            <textarea
                                rows={2}
                                required
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border mb-2"
                                placeholder="Escribe una respuesta..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={sending || !newComment.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium"
                                >
                                    {sending ? 'Enviando...' : 'Responder'}
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Fecha: {new Date(selectedTicket.createdAt).toLocaleString()}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {role === 'Admin' && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                Estado:
                                            </label>
                                            <select
                                                value={selectedTicket.status}
                                                onChange={async (e) => {
                                                    const newStatus = Number(e.target.value);
                                                    await updateStatus(selectedTicket.id, newStatus);
                                                    const label = newStatus === 2 ? 'Resuelto' : newStatus === 1 ? 'En Progreso' : 'Abierto';
                                                    toast.success(`Estado actualizado a: ${label}`);
                                                }}
                                                className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                                            >
                                                <option value={0}>Abierto</option>
                                                <option value={1}>En Progreso</option>
                                                <option value={2}>Resuelto</option>
                                            </select>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}