// En features/carrito/carrito.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http'; // <-- 1. AÑADE ESTE IMPORT
import { Subscription } from 'rxjs';
import { CartItem } from '../../core/models/cart-item.model';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service'; // <-- Importa el nuevo servicio
import { Router } from '@angular/router'; // <-- Importa el Router

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  displayedColumns: string[] = ['producto', 'precio', 'cantidad', 'subtotal', 'acciones'];
  totalCarrito = 0;
  private cartSubscription!: Subscription;

  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService, // <-- AÑADIDO
    private router: Router               // <-- AÑADIDO
  ) { }

  ngOnInit(): void {
    this.cartSubscription = this.carritoService.items$.subscribe(items => {
      this.cartItems = items;
      this.calcularTotal();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  calcularSubtotal(item: CartItem): number {
    const producto = item.producto;
    if (producto.cantidadMayorista && item.cantidad >= producto.cantidadMayorista && producto.precioMayorista) {
      return item.cantidad * producto.precioMayorista;
    }
    return item.cantidad * producto.precio;
  }

  calcularTotal(): void {
    this.totalCarrito = this.cartItems.reduce((total, item) => total + this.calcularSubtotal(item), 0);
  }

  actualizarCantidad(item: CartItem, event: any): void {
    const nuevaCantidad = (event.target as HTMLInputElement).valueAsNumber;
    this.carritoService.updateQuantity(item.producto.id, nuevaCantidad);
  }

  eliminarItem(productoId: number): void {
    this.carritoService.removeItem(productoId);
  }

  procederAlPago(): void {
    if (this.cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    this.pedidoService.crearPedido(this.cartItems).subscribe({
      next: () => {
        alert('¡Pedido realizado con éxito!');
        this.carritoService.clearCart();
        this.router.navigate(['/productos']);
      },
      // 2. AÑADE EL TIPO AQUÍ
      error: (err: HttpErrorResponse) => {
        console.error(err);
        // err.error suele contener el mensaje de texto que envía el backend (ej. "Stock insuficiente")
        alert(`Error al procesar el pedido: ${err.error}`);
      }
    });
  }
}
