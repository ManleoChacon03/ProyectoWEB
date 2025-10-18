
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core'; 
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon'; 
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; 
import { MatSort, MatSortModule } from '@angular/material/sort'; 

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatIconModule, FormsModule,
    MatPaginatorModule, MatSortModule 
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, AfterViewInit { 

  displayedColumns: string[] = ['id', 'fechaCreacion', 'clienteNombre', 'montoTotal', 'montoDevuelto', 'ventaNeta', 'estado'];
  dataSource = new MatTableDataSource<Pedido>();
  estadosPosibles = ['Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarPedidos();
  }

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
      pedido.estado = nuevoEstado; 
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

