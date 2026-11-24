import type { Ticket, Comment, TicketUser } from '../types/ticket.types';

const API_URL = 'http://localhost:5032/api';

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
};

export const getTickets = async (): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/Tickets`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Error al cargar los tickets');
    }
    return response.json();
};

export const createTicket = async (ticketData: { title: string; description: string; userId: string }) => {
    const response = await fetch(`${API_URL}/Tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
        throw new Error('Error al crear el ticket');
    }

    return response.json();
};

export const getTicketComments = async (ticketId: string): Promise<Comment[]> => {
    const response = await fetch(`${API_URL}/Tickets/${ticketId}/comments`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar comentarios');
    return response.json();
};

export const addTicketComment = async (ticketId: string, commentData: { ticketId: string; userId: string; text: string }) => {
    const response = await fetch(`${API_URL}/Tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Error al agregar comentario');
    return response.json();
};

export const updateTicketStatus = async (ticketId: string, status: number) => {
    const response = await fetch(`${API_URL}/Tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketId, status }),
    });

    if (!response.ok) throw new Error('Error al actualizar el estado');
};

export const getPaginatedTickets = async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(`${API_URL}/Tickets/paginated?page=${page}&pageSize=${pageSize}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar tickets paginados');
    return response.json();
};

export const getUsers = async (): Promise<TicketUser[]> => {
    const response = await fetch(`${API_URL}/Users`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al cargar la lista de usuarios');
    return response.json();
};

export const updateUserRole = async (userId: string, role: string) => {
    const response = await fetch(`${API_URL}/Users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Error al actualizar el rol del usuario');
    return response.json();
};

export const deleteUser = async (userId: string) => {
    const response = await fetch(`${API_URL}/Users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error al eliminar el usuario');
    }
};