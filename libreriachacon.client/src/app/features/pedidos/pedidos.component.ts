// En features/pedidos/pedidos.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core'; // <-- Se añade AfterViewInit y ViewChild
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // <-- Se importa MatPaginator y su módulo
import { MatSort, MatSortModule } from '@angular/material/sort'; // <-- Se importa MatSort y su módulo

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatFormFieldModule, MatSelectModule, FormsModule,
    MatPaginatorModule, MatSortModule // <-- Se añaden los módulos para que funcionen en el HTML
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, AfterViewInit { // <-- Se implementa AfterViewInit

  displayedColumns: string[] = ['id', 'fechaCreacion', 'clienteNombre', 'montoTotal', 'montoDevuelto', 'ventaNeta', 'estado'];
  dataSource = new MatTableDataSource<Pedido>();
  estadosPosibles = ['Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'];

  // --- CORRECCIÓN: Se usan los decoradores @ViewChild correctamente ---
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  // --- AÑADIDO: Se conecta el paginador y el sort a la tabla ---
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarPedidos(): void {
    this.pedidoService.getAllPedidos().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string): void {
    this.pedidoService.updatePedidoStatus(pedido.id, nuevoEstado).subscribe(() => {
      alert(`El estado del pedido #${pedido.id} ha sido actualizado a "${nuevoEstado}".`);
      pedido.estado = nuevoEstado; // Actualizamos localmente para no recargar todo
    });
  }

  calcularMontoDevuelto(pedido: Pedido): number {
    if (!pedido.devoluciones) return 0;
    return pedido.devoluciones
      .filter(d => d.estado === 'Aprobada')
      .reduce((sum, d) => sum + (d.montoReembolsado || 0), 0);
  }

  calcularVentaNeta(pedido: Pedido): number {
    return pedido.montoTotal - this.calcularMontoDevuelto(pedido);
  }
}

// --- Se eliminaron las funciones incorrectas que tenías al final ---
