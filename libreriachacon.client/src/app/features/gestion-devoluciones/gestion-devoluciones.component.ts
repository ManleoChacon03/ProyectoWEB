import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Devolucion } from '../../core/models/devolucion.model';
import { DevolucionService } from '../../core/services/devolucion.service';
import { DataRefreshService } from '../../core/services/data-refresh.service'; // <-- Importa el nuevo servicio


// Imports de Standalone
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-gestion-devoluciones',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './gestion-devoluciones.component.html',
  styleUrls: ['./gestion-devoluciones.component.css']
})
export class GestionDevolucionesComponent implements OnInit {

  displayedColumns: string[] = ['id', 'pedidoId', 'usuario', 'motivo', 'fechaSolicitud', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Devolucion>();

  constructor(private devolucionService: DevolucionService, private dataRefreshService: DataRefreshService ) { }

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.devolucionService.getDevoluciones().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  aprobar(devolucion: Devolucion): void {
    if (confirm(`¿Estás seguro de que deseas aprobar la devolución #${devolucion.id}? Esta acción reingresará el stock y ajustará los reportes.`)) {
      this.devolucionService.aprobarDevolucion(devolucion.id).subscribe(() => {
        alert('Devolución aprobada con éxito.');
        this.cargarDevoluciones(); // Recargamos la lista para ver el estado actualizado

        // --- AÑADIDO: Enviamos la notificación ---
        this.dataRefreshService.triggerProductListRefresh();
      });
    }
  }
}
