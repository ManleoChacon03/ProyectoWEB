import { Categoria } from "./categoria.model";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  fechaCreacion: Date;
  imagenUrl: string | null;
  categorias: Categoria[];
  estaActivo: boolean; 
  precioMayorista: number | null;
  cantidadMayorista: number | null;
}
