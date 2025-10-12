// En src/app/core/components/layout/layout.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core'; // <-- Se añaden OnInit y OnDestroy
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs'; // <-- Se añade Subscription

// --- IMPORTS DE ANGULAR MATERIAL (ya los tenías) ---
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {

  menuItems: any[] = [];
  userName: string | null = null;

  private userSubscription: Subscription;

  private adminMenu = [
    { name: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { name: 'Perfiles', route: '/perfiles', icon: 'people' },
    { name: 'Productos', route: '/productos', icon: 'inventory_2' },
    { name: 'Venta en Tienda', route: '/venta-tienda', icon: 'point_of_sale' }, // <-- Activa esta línea
    { name: 'Reportes', route: '/reportes', icon: 'bar_chart' }, // <-- Activa esta línea
    { name: 'Pedidos', route: '/pedidos', icon: 'shopping_basket' }, // <-- Activa esta línea

  ];

  private empleadoMenu = [
    { name: 'Productos', route: '/productos', icon: 'inventory_2' },
    { name: 'Venta en Tienda', route: '/venta-tienda', icon: 'point_of_sale' }, // <-- Activa esta línea
    { name: 'Pedidos', route: '/pedidos', icon: 'shopping_basket' }, // <-- Activa esta línea
  ];

  private clienteMenu = [
    { name: 'Catálogo', route: '/productos', icon: 'store' },
    { name: 'Carrito', route: '/carrito', icon: 'shopping_cart' }, // <-- Activa esta línea
    { name: 'Mis Pedidos', route: '/mis-pedidos', icon: 'receipt_long' }, // <-- Activa esta línea

    // { name: 'Mis Pedidos', route: '/mis-pedidos', icon: 'receipt_long' },
  ];

  constructor(private authService: AuthService, private router: Router) {
    // CAMBIO: El constructor ahora solo inicializa la suscripción
    this.userSubscription = new Subscription();
  }

  ngOnInit(): void {
    // CAMBIO PRINCIPAL: Nos suscribimos a los cambios del usuario en el AuthService
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.nombreCompleto;
        this.setMenuByRole(user.rol);
      } else {
        this.userName = null;
        this.menuItems = [];
      }
    });
  }

  ngOnDestroy(): void {
    // Buena práctica para evitar fugas de memoria
    this.userSubscription.unsubscribe();
  }

  setMenuByRole(role: string): void {
    switch (role) {
      case 'Administrador':
        this.menuItems = this.adminMenu;
        break;
      case 'Operador':
        this.menuItems = this.empleadoMenu;
        break;
      case 'Cliente':
        this.menuItems = this.clienteMenu;
        break;
      default:
        this.menuItems = [];
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
