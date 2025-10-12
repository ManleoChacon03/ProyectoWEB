// En features/producto-list/producto-list.component.ts

import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Producto } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service'; // <-- Importa el servicio


// --- Imports Adicionales ---
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatTableModule, MatCardModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatSortModule, MatPaginatorModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-GT' }
  ],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent implements OnInit, OnDestroy {

  userRole: string | null = null;
  isLoggedIn: boolean = false;
  private userSubscription: Subscription;

  // --- Propiedades para la tabla de Admin ---
  displayedColumns: string[] = ['imagen', 'nombre', 'precio', 'cantidadStock', 'categorias', 'acciones'];
  dataSource = new MatTableDataSource<Producto>();
  filtrosAdmin = { nombre: '', categoriaId: '', soloBajoStock: false };

  // --- Propiedades para la vista de Cliente ---
  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];
  filtrosCliente = { nombre: '', categoriaId: '' };

  categorias: Categoria[] = [];

  @ViewChild(MatSort) set matSort(sort: MatSort) { this.dataSource.sort = sort; }
  @ViewChild('adminPaginator') set adminPaginator(paginator: MatPaginator) { this.dataSource.paginator = paginator; }
  @ViewChild('clientPaginator') clientPaginator!: MatPaginator;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private carritoService: CarritoService, // <-- Inyéctalo
    public dialog: MatDialog
  ) {
    this.userSubscription = new Subscription();
    this.dataSource.filterPredicate = this.crearFiltroAdmin();
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userRole = user ? user.rol : 'Cliente';
      this.isLoggedIn = !!user;
    });
    this.cargarProductos();
    this.cargarCategorias();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe(data => {
      this.dataSource.data = data;
      this.todosLosProductos = data;
      this.aplicarFiltrosCliente();
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe(data => { this.categorias = data; });
  }

  // --- LÓGICA DE ADMIN ---
  aplicarFiltroAdmin(): void {
    this.dataSource.filter = JSON.stringify(this.filtrosAdmin);
    if (this.dataSource.paginator) { this.dataSource.paginator.firstPage(); }
  }

  crearFiltroAdmin(): (data: Producto, filter: string) => boolean {
    return (data: Producto, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      const busquedaNombre = data.nombre.toLowerCase().includes(searchTerms.nombre.toLowerCase());

      // <-- CORRECCIÓN AQUÍ: Comparamos número con número
      const busquedaCategoria = searchTerms.categoriaId === '' || data.categorias.some(c => c.id === searchTerms.categoriaId);

      const busquedaBajoStock = !searchTerms.soloBajoStock || data.cantidadStock < 10;
      return busquedaNombre && busquedaCategoria && busquedaBajoStock;
    };
  }

  abrirFormularioProducto(): void { this.editarProducto(); }

  editarProducto(producto?: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '500px',
      disableClose: true,
      data: producto
    });
    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) { this.cargarProductos(); }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas desactivar este producto? Ya no será visible en el catálogo ni se podrá vender.')) {
      this.productoService.deleteProducto(id).subscribe(() => {
        alert('Producto desactivado con éxito');
        this.cargarProductos();
      });
    }
  }

  mostrarCategorias(categorias: Categoria[]): string {
    if (!categorias || categorias.length === 0) return 'N/A';
    return categorias.map(c => c.nombre).join(', ');
  }

  // --- LÓGICA DE CLIENTE ---
  aplicarFiltrosCliente(): void {
    let productos = [...this.todosLosProductos];
    const terminoBusqueda = this.filtrosCliente.nombre.trim().toLowerCase();
    if (terminoBusqueda) {
      productos = productos.filter(p => p.nombre.toLowerCase().includes(terminoBusqueda));
    }
    const categoriaId = this.filtrosCliente.categoriaId;
    if (categoriaId) {
      // <-- CORRECCIÓN AQUÍ: Comparamos número con número
      productos = productos.filter(p => p.categorias.some(c => c.id === Number(categoriaId)));
    }
    this.productosFiltrados = productos;
    if (this.clientPaginator) { this.clientPaginator.firstPage(); }
    this.actualizarProductosPaginados();
  }

  actualizarProductosPaginados(): void {
    if (!this.clientPaginator) {
      const pageSize = 6;
      this.productosPaginados = this.productosFiltrados.slice(0, pageSize);
      return;
    }
    const pageIndex = this.clientPaginator.pageIndex;
    const pageSize = this.clientPaginator.pageSize;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    this.productosPaginados = this.productosFiltrados.slice(startIndex, endIndex);
  }
  anadirAlCarrito(producto: Producto): void {
    this.carritoService.addItem(producto);
    alert(`'${producto.nombre}' fue añadido al carrito.`); // Usamos un alert simple por ahora
  }
}
