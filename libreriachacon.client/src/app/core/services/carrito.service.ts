import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor() {
    const guardado = localStorage.getItem('carrito');
    if (guardado) {
      this.itemsSubject.next(JSON.parse(guardado));
    }
  }

  private guardarCarrito(items: CartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem('carrito', JSON.stringify(items));
  }

  addItem(producto: Producto): void {
    const items = [...this.itemsSubject.value];
    const itemExistente = items.find(i => i.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      items.push({ producto: producto, cantidad: 1 });
    }
    this.guardarCarrito(items);
  }


  updateQuantity(productoId: number, cantidad: number): void {
    let items = [...this.itemsSubject.value];
    const itemExistente = items.find(i => i.producto.id === productoId);

    if (itemExistente) {
      itemExistente.cantidad = cantidad;
    }
    
    if (cantidad <= 0) {
      items = items.filter(i => i.producto.id !== productoId);
    }
    
    this.guardarCarrito(items);
  }

  removeItem(productoId: number): void {
    const items = this.itemsSubject.value.filter(i => i.producto.id !== productoId);
    this.guardarCarrito(items);
  }

  clearCart(): void {
    this.guardarCarrito([]);
  }
}
