// En src/app/core/models/producto.dto.model.ts
export interface ProductoDto {
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  categoriaIds: number[]; // Array con los IDs de las categorías
}
