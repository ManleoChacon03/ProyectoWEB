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
  usuario: Perfil; 
  montoReembolsado?: number; 
  detalleDevolucion: DetalleDevolucion[];
}
