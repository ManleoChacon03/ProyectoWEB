import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDto } from '../../core/models/producto.dto.model';
import { Producto } from '../../core/models/producto.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatDialogModule
  ],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit {

  productoForm: FormGroup;
  categorias: Categoria[] = [];
  esModoEdicion: boolean;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public dialogRef: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Producto | null
  ) {
    
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      costo: [0, [Validators.required, Validators.min(0)]], 
      cantidadStock: [0, [Validators.required, Validators.min(0)]],
      imagenUrl: [''],
      categoriaIds: [[], Validators.required],
      precioMayorista: [null],
      cantidadMayorista: [null]
    });

   
    this.esModoEdicion = !!this.data;

    
    if (this.esModoEdicion && this.data) {
      this.productoForm.patchValue(this.data);
      const categoriaIds = this.data.categorias.map(c => c.id);
      this.productoForm.get('categoriaIds')?.setValue(categoriaIds);
    }
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe((data: Categoria[]) => {
      this.categorias = data;
    });
  }

  guardar(): void {
    if (this.productoForm.invalid) {
      return;
    }

    const productoDto: ProductoDto = this.productoForm.value;

    if (this.esModoEdicion && this.data) {
      this.productoService.updateProducto(this.data.id, productoDto).subscribe(() => {
        alert('Producto actualizado con éxito');
        this.dialogRef.close(true);
      });
    } else {
      this.productoService.addProducto(productoDto).subscribe(() => {
        alert('Producto creado con éxito');
        this.dialogRef.close(true);
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
