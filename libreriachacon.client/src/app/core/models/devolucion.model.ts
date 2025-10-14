// En src/app/core/models/devolucion.model.ts
import { Perfil } from "./perfil.model";

export interface DetalleDevolucion {
  id: number;
  productoId: number;
  cantidad: number;
}
export interface Devolucion {
  id: number;
  pedidoId: number;
  usuarioId: string;
  motivo: string;
  estado: string;
  fechaSolicitud: Date;
  usuario: Perfil; // Para mostrar el nombre del cliente
  montoReembolsado?: number; // Hacemos opcional por si aún no se ha procesado
  // --- AÑADIDO ---
  detalleDevolucion: DetalleDevolucion[];
}
