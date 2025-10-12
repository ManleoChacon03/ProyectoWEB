// En src/app/core/services/reporte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteVenta } from '../../features/reportes/reportes.component'; // Importamos la interfaz

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = '/api/reportes';

  constructor(private http: HttpClient) { }

  // Método para obtener los datos de la tabla (devuelve JSON)
  getReporteVentas(filtros: any): Observable<ReporteVenta[]> {
    const params = this.createParams(filtros);
    return this.http.get<ReporteVenta[]>(`${this.apiUrl}/ventas`, { params });
  }

  // Método para el botón de exportar (devuelve un archivo Blob)
  getReporteExcel(filtros: any): Observable<Blob> {
    const params = this.createParams(filtros);
    return this.http.get(`${this.apiUrl}/ventas/excel`, { params, responseType: 'blob' });
  }

  // Helper para crear los parámetros de la URL
  private createParams(filtros: any): HttpParams {
    return new HttpParams()
      .set('fechaInicio', new Date(filtros.fechaInicio).toISOString())
      .set('fechaFin', new Date(filtros.fechaFin).toISOString())
      .set('tipoVenta', filtros.tipoVenta ?? 'Todas');
  }
  getReportePdf(filtros: any): Observable<Blob> {
    const params = this.createParams(filtros);
    return this.http.get(`${this.apiUrl}/ventas/pdf`, { params, responseType: 'blob' });
  }
}


