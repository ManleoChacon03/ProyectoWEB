// En src/app/core/models/pedido.model.ts
import { Producto } from "./producto.model";

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioCompra: number;
  producto: Producto;
}

export interface Pedido {
  id: number;
  usuarioId: string;
  montoTotal: number;
  estado: string;
  fechaCreacion: Date;
  tipoVenta: string;
  clienteNit: string | null;
  clienteNombre: string | null;
  detallePedido: DetallePedido[];
}
