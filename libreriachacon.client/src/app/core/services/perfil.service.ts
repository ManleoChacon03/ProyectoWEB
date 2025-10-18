import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})

export class PerfilService {

  private apiUrl = '/api/perfiles'; 

  constructor(private http: HttpClient) { }


  
  registro(datosRegistro: any): Observable<Perfil> {
    return this.http.post<Perfil>(this.apiUrl, datosRegistro);
  }

  getPerfiles(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(this.apiUrl);
  }

 
  getPerfil(id: string): Observable<Perfil> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Perfil>(url);
  }

  addPerfil(perfil: Omit<Perfil, 'id' | 'fechaCreacion'>): Observable<Perfil> {
    return this.http.post<Perfil>(this.apiUrl, perfil);
  }

  
  updatePerfil(id: string, perfil: Perfil): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<void>(url, perfil);
  }

  
  deletePerfil(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
