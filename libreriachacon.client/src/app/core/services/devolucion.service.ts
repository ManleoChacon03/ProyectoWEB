// En src/app/core/services/devolucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devolucion } from '../models/devolucion.model'; // <-- Crearemos este modelo


@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  private apiUrl = '/api/devoluciones';

  constructor(private http: HttpClient) { }

  solicitarDevolucion(devolucionData: any): Observable<any> {
    return this.http.post(this.apiUrl, devolucionData);
  }
  // AÑADE ESTOS MÉTODOS
  getDevoluciones(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.apiUrl);
  }

  aprobarDevolucion(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/aprobar`, {});
  }

  // Podríamos añadir un método para rechazar en el futuro
}
