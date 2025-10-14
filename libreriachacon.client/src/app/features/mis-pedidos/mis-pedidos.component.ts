// En features/mis-pedidos/mis-pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { Pedido, DetallePedido } from '../../core/models/pedido.model'; // <-- Importa DetallePedido
import { PedidoService } from '../../core/services/pedido.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <-- 1. IMPORTA MatDialog y MatDialogModule
import { DevolucionFormComponent } from '../devolucion-form/devolucion-form.component'; // <-- 2. IMPORTA el componente del formulario


// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; // <-- 3. AÑADE para el botón

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,  // <-- 4. AÑADE el módulo aquí
    MatButtonModule   // <-- 5. Y este también
  ],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {

  pedidos: Pedido[] = [];

  constructor(
    private pedidoService: PedidoService,
    private dialog: MatDialog // Inyecta MatDialog
  ) { }

  ngOnInit(): void {
    this.pedidoService.getMisPedidos().subscribe(data => {
      this.pedidos = data;
    });
  }

  // Método para abrir el diálogo
  abrirFormularioDevolucion(pedido: Pedido): void {
    this.dialog.open(DevolucionFormComponent, {
      width: '600px',
      data: pedido // Enviamos los datos del pedido al formulario
    });
  }
  // Calcula la venta neta (Total - Devoluciones Aprobadas)
  calcularVentaNeta(pedido: Pedido): number {
    const montoDevuelto = pedido.devoluciones
      .filter(d => d.estado === 'Aprobada')
      .reduce((sum, d) => sum + (d.montoReembolsado || 0), 0);
    return pedido.montoTotal - montoDevuelto;
  }

  // Calcula la cantidad final de un producto (Comprados - Devueltos)
  calcularCantidadNeta(item: DetallePedido, pedido: Pedido): number {
    const cantidadDevuelta = pedido.devoluciones
      .filter(d => d.estado === 'Aprobada')
      .flatMap(d => d.detalleDevolucion) // Obtiene todos los items de todas las devoluciones
      .filter(dd => dd.productoId === item.producto.id)
      .reduce((sum, dd) => sum + dd.cantidad, 0);
    return item.cantidad - cantidadDevuelta;
  }
}
