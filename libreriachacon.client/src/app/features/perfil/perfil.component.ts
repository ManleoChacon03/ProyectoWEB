import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort'; 
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; 

//Imports Standalone
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; 
import { Perfil } from '../../core/models/perfil.model';
import { PerfilService } from '../../core/services/perfil.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-perfil', 
  standalone: true, 
  imports: [
   
    CommonModule,
    MatTableModule,
    RouterModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule 
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, AfterViewInit {


  displayedColumns: string[] = ['nombreCompleto', 'email', 'rol', 'acciones'];
  dataSource = new MatTableDataSource<Perfil>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private perfilService: PerfilService) { }

  ngOnInit(): void {
    this.cargarPerfiles();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarPerfiles(): void {
    this.perfilService.getPerfiles().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarPerfil(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
      this.perfilService.deletePerfil(id).subscribe({
        next: () => {
          alert('Perfil eliminado con éxito.');
          this.cargarPerfiles();
        },
        error: (err) => {
          console.error('Error al eliminar el perfil', err);
          alert('Hubo un error al intentar eliminar el perfil.');
        }
      });
    }
  }
}
