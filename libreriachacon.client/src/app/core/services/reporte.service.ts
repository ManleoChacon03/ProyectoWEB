import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteVenta } from '../../features/reportes/reportes.component'; 

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = '/api/reportes';

  constructor(private http: HttpClient) { }

  getReporteVentas(filtros: any): Observable<ReporteVenta[]> {
    const params = this.createParams(filtros);
    return this.http.get<ReporteVenta[]>(`${this.apiUrl}/ventas`, { params });
  }

  getReporteExcel(filtros: any): Observable<Blob> {
    const params = this.createParams(filtros);
    return this.http.get(`${this.apiUrl}/ventas/excel`, { params, responseType: 'blob' });
  }

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


