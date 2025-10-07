// En features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importamos HttpClient
import { Observable } from 'rxjs';

// --- IMPORTS DE ANGULAR MATERIAL ---
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

// Creamos una interfaz para los datos que recibiremos
export interface DashboardStats {
  totalProductos: number;
  totalClientes: number;
  productosBajoStock: number;
  totalPedidos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // <-- 2. AÑADE RouterModule aquí
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Usamos un Observable para manejar los datos de forma reactiva
  stats$: Observable<DashboardStats>;

  constructor(private http: HttpClient) {
    // Inicializamos el observable vacío
    this.stats$ = new Observable<DashboardStats>();
  }

  ngOnInit(): void {
    // Al iniciar el componente, hacemos la llamada a la API
    this.stats$ = this.http.get<DashboardStats>('/api/dashboard/stats');
  }
}
