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
