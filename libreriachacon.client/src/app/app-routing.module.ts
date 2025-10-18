import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerfilComponent } from './features/perfil/perfil.component';
import { ProductoListComponent } from './features/producto-list/producto-list.component';
import { RegistroComponent } from './features/registro/registro.component';
import { LoginComponent } from './features/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { VentaTiendaComponent } from './features/venta-tienda/venta-tienda.component'; 
import { ReportesComponent } from './features/reportes/reportes.component'; 
import { CarritoComponent } from './features/carrito/carrito.component'; 
import { MisPedidosComponent } from './features/mis-pedidos/mis-pedidos.component'; 
import { PedidosComponent } from './features/pedidos/pedidos.component'; 
import { GestionDevolucionesComponent } from './features/gestion-devoluciones/gestion-devoluciones.component'; 
import { InventarioComponent } from './features/inventario/inventario.component';



const routes: Routes = [
  // RUTAS PÚBLICAS 
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'catalogo-publico', component: ProductoListComponent },

  //  RUTAS PRIVADAS
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // La ruta principal  redirige a 'dashboard'
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardComponent },

      { path: 'perfiles', component: PerfilComponent },
      { path: 'productos', component: ProductoListComponent },
      { path: 'venta-tienda', component: VentaTiendaComponent },
      { path: 'reportes', component: ReportesComponent }, 
      { path: 'carrito', component: CarritoComponent }, 
      { path: 'pedidos', component: PedidosComponent }, 
      { path: 'mis-pedidos', component: MisPedidosComponent }, 
      { path: 'gestion-devoluciones', component: GestionDevolucionesComponent }, 
      { path: 'inventario', component: InventarioComponent },


    ]
  },

  // RUTA AL CATOLOGO PUBLICO
  { path: '**', redirectTo: '/catalogo-publico' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
