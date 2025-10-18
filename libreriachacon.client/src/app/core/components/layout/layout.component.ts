
import { Component, OnDestroy, OnInit } from '@angular/core'; 
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs'; 

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
    { name: 'Venta en Tienda', route: '/venta-tienda', icon: 'point_of_sale' },
    { name: 'Reportes', route: '/reportes', icon: 'bar_chart' }, 
    { name: 'Pedidos', route: '/pedidos', icon: 'shopping_basket' }, 
    { name: 'Devoluciones', route: '/gestion-devoluciones', icon: 'assignment_return' }, 
    { name: 'Inventario', route: '/inventario', icon: 'inventory' },

  ];

  private empleadoMenu = [
    { name: 'Productos', route: '/productos', icon: 'inventory_2' },
    { name: 'Venta en Tienda', route: '/venta-tienda', icon: 'point_of_sale' }, 
    { name: 'Pedidos', route: '/pedidos', icon: 'shopping_basket' }, 
    { name: 'Devoluciones', route: '/gestion-devoluciones', icon: 'assignment_return' }, 
    { name: 'Inventario', route: '/inventario', icon: 'inventory' },

  ];

  private clienteMenu = [
    { name: 'Catálogo', route: '/productos', icon: 'store' },
    { name: 'Carrito', route: '/carrito', icon: 'shopping_cart' }, 
    { name: 'Mis Pedidos', route: '/mis-pedidos', icon: 'receipt_long' }, 

  ];

  constructor(private authService: AuthService, private router: Router) {
    this.userSubscription = new Subscription();
  }

  ngOnInit(): void {
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
