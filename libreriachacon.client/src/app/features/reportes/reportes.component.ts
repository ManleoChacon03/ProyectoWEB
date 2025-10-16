// En features/reportes/reportes.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ReporteService } from '../../core/services/reporte.service'; // Se usa el servicio
import { saveAs } from 'file-saver'; // Se importa 'saveAs'

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- AGREGAR
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Interfaz para el reporte
export interface ReporteVenta {
  pedidoId: number;
  fechaVenta: Date;
  tipoVenta: string;
  vendidoPor: string;
  clienteNombre: string;
  clienteNit: string;
  totalItems: number;
  montoTotal: number;
  montoDevuelto: number;
  ventaNeta: number;
  ganancia: number;
  iva: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatTableModule, MatFormFieldModule,
    MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {

  filtroForm = new FormGroup({
    fechaInicio: new FormControl<Date | null>(null),
    fechaFin: new FormControl<Date | null>(null),
    tipoVenta: new FormControl('Todas')
  });

  displayedColumns: string[] = ['pedidoId', 'fechaVenta', 'tipoVenta', 'clienteNombre', 'totalItems', 'montoTotal', 'montoDevuelto', 'ventaNeta', 'iva', 'ganancia'];
  dataSource = new MatTableDataSource<ReporteVenta>();
  totalVentaNeta = 0;
  totalGanancia = 0;
  totalGeneralVentas = 0;

  constructor(private reporteService: ReporteService) { } // Se inyecta el servicio

  generarReporte(): void {
    if (!this.filtroForm.value.fechaInicio || !this.filtroForm.value.fechaFin) {
      alert('Por favor, selecciona un rango de fechas.');
      return;
    }

    this.reporteService.getReporteVentas(this.filtroForm.value).subscribe((data: ReporteVenta[]) => {
      this.dataSource.data = data;
      // Actualizamos los totales con los nuevos datos
      this.totalVentaNeta = data.reduce((sum, item) => sum + item.ventaNeta, 0);
      this.totalGanancia = data.reduce((sum, item) => sum + item.ganancia, 0);
      this.totalGeneralVentas = data.reduce((sum, item) => sum + item.montoTotal, 0);
    });
  }

  exportarExcel(): void {
    if (!this.filtroForm.value.fechaInicio || !this.filtroForm.value.fechaFin) {
      alert('Por favor, selecciona un rango de fechas para exportar.');
      return;
    }

    this.reporteService.getReporteExcel(this.filtroForm.value).subscribe((blob: Blob) => { // <-- TIPO AÑADIDO
      saveAs(blob, `ReporteVentas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  }

  exportarPdf(): void {
    if (!this.filtroForm.value.fechaInicio || !this.filtroForm.value.fechaFin) {
      alert('Por favor, selecciona un rango de fechas para exportar.');
      return;
    }

    this.reporteService.getReportePdf(this.filtroForm.value).subscribe(blob => {
      saveAs(blob, `ReporteVentas_${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  }
}
