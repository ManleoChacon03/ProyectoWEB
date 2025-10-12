// En features/pedidos/pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';

// Imports de Standalone
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  displayedColumns: string[] = ['id', 'fechaCreacion', 'clienteNombre', 'tipoVenta', 'montoTotal', 'estado'];
  dataSource = new MatTableDataSource<Pedido>();
  estadosPosibles = ['Pendiente', 'Procesando', 'Enviado', 'Completado', 'Cancelado'];

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.pedidoService.getAllPedidos().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string): void {
    this.pedidoService.updatePedidoStatus(pedido.id, nuevoEstado).subscribe(() => {
      // Actualizamos el estado localmente para no tener que recargar toda la lista
      pedido.estado = nuevoEstado;
      alert(`El estado del pedido #${pedido.id} ha sido actualizado a "${nuevoEstado}".`);
    });
  }
}
