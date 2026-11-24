import { create } from 'zustand';
import type { Ticket, Comment } from '../types/ticket.types';
import { getPaginatedTickets, getTicketComments } from '../services/api';
import { updateTicketStatus } from '../services/api';

interface TicketState {
    tickets: Ticket[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    selectedTicket: Ticket | null;
    isModalOpen: boolean;
    comments: Comment[];
    loadingComments: boolean;

    fetchTickets: (page?: number) => Promise<void>;
    openModal: (ticket: Ticket) => Promise<void>;
    closeModal: () => void;
    fetchComments: (ticketId: string) => Promise<void>;
    updateStatus: (ticketId: string, status: number) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
    tickets: [],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    selectedTicket: null,
    isModalOpen: false,
    comments: [],
    loadingComments: false,

    fetchTickets: async (page = 1) => {
        set({ loading: true });
        try {
            const data = await getPaginatedTickets(page, 10);
            set({
                tickets: data.items,
                currentPage: page,
                totalPages: data.totalPages
            });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    fetchComments: async (ticketId: string) => {
        set({ loadingComments: true });
        try {
            const data = await getTicketComments(ticketId);
            set({ comments: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loadingComments: false });
        }
    },

    openModal: async (ticket) => {
        set({ selectedTicket: ticket, isModalOpen: true, comments: [], loadingComments: true });
        await get().fetchComments(ticket.id);
    },

    updateStatus: async (ticketId, status) => {
        try {
            await updateTicketStatus(ticketId, status);
            // Recargamos los tickets para que la tabla se actualice
            await get().fetchTickets();

            // Si el ticket modificado es el que está abierto en el modal, lo actualizamos localmente
            const currentTicket = get().selectedTicket;
            if (currentTicket && currentTicket.id === ticketId) {
                set({ selectedTicket: { ...currentTicket, status } });
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el estado del ticket.');
        }
    },

    closeModal: () => set({ selectedTicket: null, isModalOpen: false, comments: [] })
}));