// En src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilComponent } from './features/perfil/perfil.component';
import { ProductoListComponent } from './features/producto-list/producto-list.component';
import { RegistroComponent } from './features/registro/registro.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { VentaTiendaComponent } from './features/venta-tienda/venta-tienda.component'; // <-- 1. Importa el componente
import { ReportesComponent } from './features/reportes/reportes.component'; // <-- 1. Importa
import { CarritoComponent } from './features/carrito/carrito.component'; // <-- 1. Importa
import { MisPedidosComponent } from './features/mis-pedidos/mis-pedidos.component'; // <-- 1. Importa
import { PedidosComponent } from './features/pedidos/pedidos.component'; // <-- 1. Importa


const routes: Routes = [
  // --- RUTAS PÚBLICAS (No usan el layout con sidebar) ---
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'catalogo-publico', component: ProductoListComponent },

  // --- RUTAS PRIVADAS (Usan el layout con sidebar) ---
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // CAMBIO 1: La ruta principal ahora redirige a 'dashboard'
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // CAMBIO 2: Se activa la ruta para el DashboardComponent
      { path: 'dashboard', component: DashboardComponent },

      { path: 'perfiles', component: PerfilComponent },
      { path: 'productos', component: ProductoListComponent },
      { path: 'venta-tienda', component: VentaTiendaComponent }, // <-- 2. Añade la nueva ruta
      { path: 'reportes', component: ReportesComponent }, // <-- 2. Añade la ruta
      { path: 'carrito', component: CarritoComponent }, // <-- 2. Añade la ruta
      { path: 'pedidos', component: PedidosComponent }, // <-- 2. Añade la nueva ruta
      { path: 'mis-pedidos', component: MisPedidosComponent }, // <-- 2. Añade la ruta




      // Aquí añadiremos las demás rutas privadas: /pedidos, /reportes, etc.
    ]
  },

  // --- RUTA COMODÍN ---
  { path: '**', redirectTo: '/catalogo-publico' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
