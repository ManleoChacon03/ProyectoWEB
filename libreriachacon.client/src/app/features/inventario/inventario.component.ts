import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Producto } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { saveAs } from 'file-saver';

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['nombre', 'categorias', 'cantidadStock', 'precio'];
  dataSource = new MatTableDataSource<Producto>();
  categorias: Categoria[] = [];
  filtros = { nombre: '', categoriaId: '' };

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private categoriaService: CategoriaService
  ) {
    this.dataSource.filterPredicate = this.crearFiltro();
  }

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarCategorias();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarInventario(): void {
    this.http.get<Producto[]>('/api/inventario').subscribe(data => {
      this.dataSource.data = data;
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data;
    });
  }

  aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify(this.filtros);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  crearFiltro(): (data: Producto, filter: string) => boolean {
    return (data: Producto, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      const busquedaNombre = data.nombre.toLowerCase().includes(searchTerms.nombre.toLowerCase());
      const busquedaCategoria = searchTerms.categoriaId === '' || data.categorias.some(c => c.id.toString() === searchTerms.categoriaId);
      return busquedaNombre && busquedaCategoria;
    };
  }

  exportarPdf(): void {
    this.http.get('/api/inventario/pdf', { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, `ReporteInventario_${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  }

  mostrarCategorias(categorias: Categoria[]): string {
    if (!categorias || categorias.length === 0) return 'N/A';
    return categorias.map(c => c.nombre).join(', ');
  }
}
