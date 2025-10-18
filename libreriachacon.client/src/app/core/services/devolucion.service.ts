import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devolucion } from '../models/devolucion.model'; 


@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  private apiUrl = '/api/devoluciones';

  constructor(private http: HttpClient) { }

  solicitarDevolucion(devolucionData: any): Observable<any> {
    return this.http.post(this.apiUrl, devolucionData);
  }
  getDevoluciones(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.apiUrl);
  }

  aprobarDevolucion(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/aprobar`, {});
  }

}
