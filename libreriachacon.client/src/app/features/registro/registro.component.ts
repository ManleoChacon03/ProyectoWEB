import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from '../../core/services/perfil.service'; // <-- CAMBIO: Importamos PerfilService

// Módulos necesarios para el componente standalone
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  hidePassword = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService, // <-- CAMBIO: Inyectamos PerfilService en lugar de AuthService
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    // <-- CAMBIO: Usamos perfilService para llamar al método de registro
    this.perfilService.registro(this.registroForm.value).subscribe({
      next: () => {
        this.successMessage = '¡Registro exitoso! Serás redirigido al login en 3 segundos.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error en el registro', err);
        // El error del backend ahora puede ser más específico (ej. "El correo ya existe")
        this.errorMessage = err.error.title || err.error || 'Ocurrió un error en el registro.';
      }
    });
  }
}
