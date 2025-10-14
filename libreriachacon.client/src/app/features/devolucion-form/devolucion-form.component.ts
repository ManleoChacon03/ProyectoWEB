// En features/devolucion-form/devolucion-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DevolucionService } from '../../core/services/devolucion.service';
import { Pedido } from '../../core/models/pedido.model';

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-devolucion-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatCheckboxModule
  ],
  templateUrl: './devolucion-form.component.html',
  styleUrls: ['./devolucion-form.component.css']
})
export class DevolucionFormComponent implements OnInit {

  devolucionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private devolucionService: DevolucionService,
    public dialogRef: MatDialogRef<DevolucionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public pedido: Pedido // Recibimos el pedido completo
  ) {
    this.devolucionForm = this.fb.group({
      motivo: ['', Validators.required],
      items: this.fb.array([]) // El FormArray para los productos
    });
  }

  ngOnInit(): void {
    // Llenamos el FormArray con los productos del pedido
    this.pedido.detallePedido.forEach(item => {
      this.items.push(this.fb.group({
        seleccionar: [false], // Checkbox para seleccionar si se devuelve
        productoId: [item.producto.id],
        nombre: [item.producto.nombre],
        // Validador para que la cantidad no sea mayor a la comprada
        cantidad: [item.cantidad, [Validators.max(item.cantidad), Validators.min(1)]],
        cantidadOriginal: [item.cantidad] // Guardamos la cantidad original para mostrarla
      }));
    });
  }

  // Getter para acceder fácilmente al FormArray
  get items(): FormArray {
    return this.devolucionForm.get('items') as FormArray;
  }

  solicitar(): void {
    if (this.devolucionForm.invalid) {
      return;
    }

    // Filtramos solo los items que el usuario seleccionó
    const itemsSeleccionados = this.devolucionForm.value.items
      .filter((item: any) => item.seleccionar)
      .map((item: any) => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      }));

    if (itemsSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un producto para devolver.');
      return;
    }

    const devolucionData = {
      pedidoId: this.pedido.id,
      motivo: this.devolucionForm.value.motivo,
      items: itemsSeleccionados
    };

    this.devolucionService.solicitarDevolucion(devolucionData).subscribe({
      next: () => {
        alert('Solicitud de devolución enviada con éxito.');
        this.dialogRef.close(true); // Cerramos el diálogo
      },
      error: (err) => {
        console.error(err);
        alert(`Error al enviar la solicitud: ${err.error}`);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
