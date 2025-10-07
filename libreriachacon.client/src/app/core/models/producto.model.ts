// En src/app/core/models/producto.model.ts
import { Categoria } from "./categoria.model";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  fechaCreacion: Date;
  imagenUrl: string | null; // <-- AÑADE ESTA LÍNEA
  categorias: Categoria[];
}
