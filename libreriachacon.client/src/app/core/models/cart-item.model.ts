// En src/app/core/models/cart-item.model.ts
import { Producto } from "./producto.model";

export interface CartItem {
  producto: Producto;
  cantidad: number;
}
