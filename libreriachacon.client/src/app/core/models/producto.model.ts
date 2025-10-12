// En src/app/core/models/producto.model.ts
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
  estaActivo: boolean; // Esta propiedad también faltaba aquí

  // --- AÑADE ESTAS DOS LÍNEAS ---
  precioMayorista: number | null;
  cantidadMayorista: number | null;
}
