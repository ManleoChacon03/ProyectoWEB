import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http'; 
import { Subscription } from 'rxjs';
import { CartItem } from '../../core/models/cart-item.model';
import { CarritoService } from '../../core/services/carrito.service';
import { PedidoService } from '../../core/services/pedido.service'; 
import { Router } from '@angular/router'; 

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip'; 


@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule
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
    private pedidoService: PedidoService, 
    private router: Router               
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

  getTotalUnidades(): number {
    return this.cartItems.reduce((sum, item) => sum + item.cantidad, 0);
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
      error: (err: HttpErrorResponse) => {
        console.error(err);
        alert(`Error al procesar el pedido: ${err.error}`);
      }
    });
  }
}
