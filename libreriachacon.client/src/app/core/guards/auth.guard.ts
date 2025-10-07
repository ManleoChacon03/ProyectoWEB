// En src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importamos nuestro servicio

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService, // Inyectamos el servicio de autenticación
    private router: Router // Inyectamos el Router para poder redirigir
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    // Preguntamos al servicio si el usuario ha iniciado sesión
    if (this.authService.isLoggedIn()) {
      return true; // Si ha iniciado sesión, permite el acceso a la ruta
    } else {
      // Si no ha iniciado sesión, redirige a la página de login
      this.router.navigate(['/login']);
      return false; // Y no permite el acceso a la ruta
    }
  }
}
