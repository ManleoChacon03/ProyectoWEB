// En features/venta-tienda/venta-tienda.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
import { Producto } from '../../core/models/producto.model';
import { VentaItemDto } from '../../core/models/venta.dto.model'; // <-- Crearemos este modelo


// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-venta-tienda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatTableModule, MatButtonModule, MatIconModule, FormsModule
  ],
  templateUrl: './venta-tienda.component.html',
  styleUrls: ['./venta-tienda.component.css']
})
export class VentaTiendaComponent implements OnInit {

  clienteForm: FormGroup;
  searchControl = new FormControl();
  filteredProducts$: Observable<Producto[]>;

  ventaItems: VentaItemDto[] = [];
  displayedColumns: string[] = ['nombre', 'cantidad', 'precio', 'subtotal', 'acciones'];
  totalVenta = 0;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.clienteForm = this.fb.group({
      clienteNit: [''],
      clienteNombre: ['']
    });

    this.filteredProducts$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Espera 300ms después de que el usuario deja de escribir
      switchMap(value => this._filterProducts(value || ''))
    );
  }

  ngOnInit(): void { }

  private _filterProducts(value: string): Observable<Producto[]> {
    if (typeof value !== 'string' || value.length < 2) {
      return of([]); // Solo busca si hay al menos 2 caracteres
    }
    // Llamamos a la API de productos para buscar
    return this.http.get<Producto[]>('/api/productos').pipe(
      map(productos => productos.filter(p => p.nombre.toLowerCase().includes(value.toLowerCase())))
    );
  }

  displayProduct(producto: Producto): string {
    return producto ? producto.nombre : '';
  }

  addProduct(producto: Producto): void {
    if (!producto) return;
    const existingItem = this.ventaItems.find(item => item.productoId === producto.id);
    if (existingItem) {
      existingItem.cantidad++;
    } else {
      this.ventaItems.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        // --- AÑADIDO: Guardamos las reglas de mayoreo ---
        precioMayorista: producto.precioMayorista,
        cantidadMayorista: producto.cantidadMayorista
      });
    }
    this.actualizarVenta();
    this.searchControl.setValue('');
  }

  // --- AÑADIDO: Función para calcular el subtotal de un item ---
  calcularSubtotal(item: VentaItemDto): number {
    // Si hay regla de mayoreo y la cantidad la cumple, usamos el precio mayorista
    if (item.cantidadMayorista && item.cantidad >= item.cantidadMayorista && item.precioMayorista) {
      return item.cantidad * item.precioMayorista;
    }
    // Si no, usamos el precio normal
    return item.cantidad * item.precio;
  }

  removeItem(productoId: number): void {
    this.ventaItems = this.ventaItems.filter(item => item.productoId !== productoId);
    this.actualizarVenta();
  }

  actualizarVenta(): void {
    this.ventaItems = this.ventaItems.filter(item => item.cantidad > 0);
    this.ventaItems = [...this.ventaItems];
    // --- MODIFICADO: El total ahora usa la nueva función de cálculo ---
    this.totalVenta = this.ventaItems.reduce((total, item) => total + this.calcularSubtotal(item), 0);
  }


  finalizarVenta(): void {
    if (this.ventaItems.length === 0) {
      alert("Debe añadir al menos un producto a la venta.");
      return;
    }

    const ventaData = {
      ...this.clienteForm.value,
      items: this.ventaItems.map(({ productoId, cantidad }) => ({ productoId, cantidad }))
    };

    this.http.post('/api/ventas/tienda', ventaData).subscribe({
      next: () => {
        alert('Venta registrada con éxito!');
        // Limpiamos todo para la siguiente venta
        this.ventaItems = [];
        this.clienteForm.reset();
        this.actualizarVenta();
      },
      error: (err) => {
        console.error(err);
        alert(`Error al registrar la venta: ${err.error}`);
      }
    });
  }
}
