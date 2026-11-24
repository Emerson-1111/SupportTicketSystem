export interface TicketUser {
    id: string;
    name: string;
    email: string;
    role?: string;
    ticketsCount?: number;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    aiCategory: string;
    priority: number; // 0 = Baja, 1 = Media, 2 = Alta
    status: number;   // 0 = Abierto, 1 = EnProgreso, 2 = Resuelto
    createdAt: string;
    queuePosition?: number | null;
    userId?: string;
    user?: TicketUser;
}

export interface Comment {
    id: string;
    text: string;
    createdAt: string;
    ticketId: string;
    userId: string;
    user?: TicketUser;
}