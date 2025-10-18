import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';
import { jwtDecode } from 'jwt-decode'; 
import { CurrentUser } from '../models/current-user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    
    this.loadUserFromToken();
  }

  public get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        const user = this.decodeToken(response.token);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
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
      const user: CurrentUser = {
        id: decodedToken.sub,
        email: decodedToken.email,
        nombreCompleto: decodedToken.nombre_completo,
        rol: decodedToken.role 
      };
      return user;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  }
}
