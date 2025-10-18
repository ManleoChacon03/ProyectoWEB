import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
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
    RouterModule, 
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

  stats$: Observable<DashboardStats>;

  constructor(private http: HttpClient) {
    this.stats$ = new Observable<DashboardStats>();
  }

  ngOnInit(): void {
    // Al iniciar el componente, hacemos la llamada a la API
    this.stats$ = this.http.get<DashboardStats>('/api/dashboard/stats');
  }
}
