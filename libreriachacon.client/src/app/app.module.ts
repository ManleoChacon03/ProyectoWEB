// --- AÑADIDO: IMPORTACIONES PARA EL INTERCEPTOR ---
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
// --------------------------------------------------
import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeGt from '@angular/common/locales/es-GT'; // <-- Importa los datos de Guatemala

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';


// IMPORTS para Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { CategoriaComponent } from './features/categoria/categoria.component';
import { ProductoListComponent } from './features/producto-list/producto-list.component';
import { ProductoFormComponent } from './features/producto-form/producto-form.component';
import { LoginComponent } from './features/login/login.component';
import { RegistroComponent } from './features/registro/registro.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VentaTiendaComponent } from './features/venta-tienda/venta-tienda.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { CarritoComponent } from './features/carrito/carrito.component';
import { MisPedidosComponent } from './features/mis-pedidos/mis-pedidos.component';
import { PedidosComponent } from './features/pedidos/pedidos.component';
import { DevolucionFormComponent } from './features/devolucion-form/devolucion-form.component';
import { GestionDevolucionesComponent } from './features/gestion-devoluciones/gestion-devoluciones.component';

registerLocaleData(localeGt, 'es-GT');
@NgModule({
  declarations: [
    AppComponent,
    CategoriaComponent,
    
    
    // Este componente parece no ser standalone, por eso se queda aquí.
  ],
  imports: [
    // Módulos
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    // Módulos de Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule, // <-- Faltaban estos en tu lista original, los añadí por si acaso
    MatListModule,
    MatToolbarModule,

    // --- Componentes Standalone ---
    PerfilComponent,
    ProductoListComponent,
    ProductoFormComponent,
    LoginComponent,
    RegistroComponent,
    LayoutComponent,
    DashboardComponent,
    VentaTiendaComponent,
    ReportesComponent,
    CarritoComponent,
    MisPedidosComponent,
    PedidosComponent,
    DevolucionFormComponent,
    GestionDevolucionesComponent,
  ],
  // --- AÑADIDO: REGISTRO DEL INTERCEPTOR ---
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'es-GT' } // <-- AÑADE ESTA LÍNEA
  ],
  // ------------------------------------------
  bootstrap: [AppComponent]
})
export class AppModule { }
