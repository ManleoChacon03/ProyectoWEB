export interface VentaItemDto {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  precioMayorista?: number | null;
  cantidadMayorista?: number | null;
}
