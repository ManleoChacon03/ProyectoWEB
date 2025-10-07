// En src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})

export class PerfilService {

  private apiUrl = '/api/perfiles'; // URL base de la API de perfiles

  constructor(private http: HttpClient) { }


  /**
   * Crea un nuevo perfil (registro).
   * Corresponde a: POST /api/perfiles
   */
  registro(datosRegistro: any): Observable<Perfil> {
    return this.http.post<Perfil>(this.apiUrl, datosRegistro);
  }

  /**
   * Obtiene todos los perfiles del servidor.
   * Corresponde a: GET /api/perfiles
   */
  getPerfiles(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(this.apiUrl);
  }

  /**
   * Obtiene un perfil específico por su ID.
   * Corresponde a: GET /api/perfiles/{id}
   */
  getPerfil(id: string): Observable<Perfil> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Perfil>(url);
  }

  /**
   * Crea un nuevo perfil en el servidor.
   * El ID y la fecha se omiten porque el backend los genera.
   * Corresponde a: POST /api/perfiles
   */
  addPerfil(perfil: Omit<Perfil, 'id' | 'fechaCreacion'>): Observable<Perfil> {
    return this.http.post<Perfil>(this.apiUrl, perfil);
  }

  /**
   * Actualiza un perfil existente en el servidor.
   * Corresponde a: PUT /api/perfiles/{id}
   */
  updatePerfil(id: string, perfil: Perfil): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<void>(url, perfil);
  }

  /**
   * Elimina un perfil del servidor por su ID.
   * Corresponde a: DELETE /api/perfiles/{id}
   */
  deletePerfil(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
