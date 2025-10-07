// En features/producto-form/producto-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Categoria } from '../../core/models/categoria.model'; // <-- Asegúrate de tener esta importación
import { CategoriaService } from '../../core/services/categoria.service'; // <-- **CORRECCIÓN 1: FALTABA ESTA LÍNEA**
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDto } from '../../core/models/producto.dto.model';

// ... (El resto de tus imports de Material y otros módulos)
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit {

  productoForm: FormGroup;
  categorias: Categoria[] = [];

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public dialogRef: MatDialogRef<ProductoFormComponent>
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      cantidadStock: [0, [Validators.required, Validators.min(0)]],
      imagenUrl: [''],
      categoriaIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    // **CORRECCIÓN 2: AÑADIR EL TIPO (data: Categoria[])**
    this.categoriaService.getCategorias().subscribe((data: Categoria[]) => {
      this.categorias = data;
    });
  }

  guardar(): void {
    if (this.productoForm.invalid) {
      return;
    }

    const productoDto: ProductoDto = this.productoForm.value;

    this.productoService.addProducto(productoDto).subscribe(() => {
      alert('Producto creado con éxito');
      this.dialogRef.close(true);
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
