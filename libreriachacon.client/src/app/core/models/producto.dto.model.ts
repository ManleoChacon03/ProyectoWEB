export interface ProductoDto {
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadStock: number;
  categoriaIds: number[]; 
}
