// En src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';
import { jwtDecode } from 'jwt-decode'; // <-- Importamos la nueva librería
import { CurrentUser } from '../models/current-user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  // BehaviorSubject para mantener el estado actual del usuario.
  // Es "reactivo": notifica a los suscriptores cuando el valor cambia.
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  // Exponemos el estado como un Observable público para que los componentes se suscriban.
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Al iniciar el servicio, intentamos cargar al usuario desde el token guardado.
    // Esto mantiene la sesión activa si se recarga la página.
    this.loadUserFromToken();
  }

  // Getter para acceder al valor actual del usuario de forma síncrona.
  public get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Cuando el login es exitoso...
        this.saveToken(response.token);
        const user = this.decodeToken(response.token);
        // Notificamos a toda la aplicación que un nuevo usuario ha iniciado sesión.
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    // Notificamos a toda la aplicación que el usuario ha cerrado sesión.
    this.currentUserSubject.next(null);
    // Redirigimos al login.
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
    }
  }

  private decodeToken(token: string): CurrentUser | null {
    try {
      const decodedToken: any = jwtDecode(token);

      // Mapeamos los "claims" del token a nuestro modelo CurrentUser.
      // Ojo: los nombres deben coincidir con los que pusiste en el backend (AuthController).
      const user: CurrentUser = {
        id: decodedToken.sub,
        email: decodedToken.email,
        nombreCompleto: decodedToken.nombre_completo,
        rol: decodedToken.role // En el token, el claim de rol se llama 'role'
      };
      return user;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }
}
