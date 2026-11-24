import type { Ticket } from '../types/ticket.types';

export const downloadTicketsCSV = (tickets: Ticket[], filename: string = 'reporte-tickets.csv') => {
    // Definir los encabezados del archivo
    const headers = ['ID,Usuario,Correo,Problema,Categoría IA,Prioridad,Estado,Fecha'];

    // Funciones auxiliares para texto legible
    const getPrioridad = (p: number) => p === 2 ? 'Alta' : p === 1 ? 'Media' : 'Baja';
    const getEstado = (e: number) => e === 2 ? 'Resuelto' : e === 1 ? 'En Progreso' : 'Abierto';

    // Formatear cada ticket como una fila de CSV
    const rows = tickets.map(t => {
        // Escapamos las comillas dobles y envolvemos los textos para evitar que las comas rompan las columnas
        const title = t.title.replace(/"/g, '""');
        const userName = (t.user?.name || 'Desconocido').replace(/"/g, '""');
        const userEmail = (t.user?.email || '').replace(/"/g, '""');
        return `"${t.id}","${userName}","${userEmail}","${title}","${t.aiCategory}","${getPrioridad(t.priority)}","${getEstado(t.status)}","${new Date(t.createdAt).toLocaleDateString()}"`;
    });

    // Unir todo con saltos de línea
    const csvContent = [headers, ...rows].join('\n');

    // Crear el Blob y forzar la descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};