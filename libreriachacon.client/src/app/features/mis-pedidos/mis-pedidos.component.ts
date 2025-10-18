import { Component, OnInit } from '@angular/core';
import { Pedido, DetallePedido } from '../../core/models/pedido.model'; 
import { PedidoService } from '../../core/services/pedido.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { DevolucionFormComponent } from '../devolucion-form/devolucion-form.component'; 
import { saveAs } from 'file-saver'; 


// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,  
    MatButtonModule   
  ],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {

  pedidos: Pedido[] = [];

  constructor(
    private pedidoService: PedidoService,
    private dialog: MatDialog 
  ) { }

  ngOnInit(): void {
    this.pedidoService.getMisPedidos().subscribe(data => {
      this.pedidos = data;
    });
  }

  abrirFormularioDevolucion(pedido: Pedido): void {
    this.dialog.open(DevolucionFormComponent, {
      width: '600px',
      data: pedido 
    });
  }

  descargarFactura(pedido: Pedido): void {
    this.pedidoService.getFacturaPdf(pedido.id).subscribe(blob => {
      saveAs(blob, `Factura-Orden-${pedido.id}.pdf`);
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
      .flatMap(d => d.detalleDevolucion) 
      .filter(dd => dd.productoId === item.producto.id)
      .reduce((sum, dd) => sum + dd.cantidad, 0);
    return item.cantidad - cantidadDevuelta;
  }
}
