import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule,MatSnackBar } from '@angular/material/snack-bar';

import { GlobalConfigurationService } from '../../services/global-configuration-service';
import { AuthenticationService } from '../../services/authentication-service';
import { AuthResponse } from '../../interfaces/user-model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  //mensajeError = ''; // 👈 NUEVA propiedad visible en pantalla

  constructor(
    public configService: GlobalConfigurationService,
    private fb: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
  private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<LoginComponent>
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

onSubmit(): void {
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  this.loginForm.disable();
  //this.mensajeError = ''; // limpia mensaje anterior (esto puede eliminarse si solo se usa el snackbar)

  this.authService.login(this.loginForm.value)
    .pipe(finalize(() => {
      this.isLoading = false;
      this.loginForm.enable();
    }))
    .subscribe({
      next: (response: AuthResponse) => {
        // Lógica de éxito (sin cambios)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          try {
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            localStorage.setItem('currentUser', JSON.stringify(payload));
            console.log('Login exitoso. Usuario:', payload.nombre, 'Rol:', payload.rol);
            // Mostrar un snackbar de éxito si se desea, similar a onDelete, ej:
            /*
            this.snackBar.open(`¡Bienvenido, ${payload.nombre}!`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              panelClass: ['success-snackbar']
            });
            */
          } catch (e) {
            console.error('Error al decodificar token:', e);
          }
          this.dialogRef.close(true);
        } else {
          // Si el backend devuelve un objeto vacío o sin token en caso de credenciales inválidas.
          const mensajeAmostrar = 'Email o contraseña incorrectos.';
          // Reemplazado por snackbar: this.mensajeError = mensajeAmostrar;
          this.mostrarErrorEnSnackbar(mensajeAmostrar);
        }
      },
      error: (err) => {
        console.error('Error completo:', err);
        
        let mensajeAmostrar = 'Ocurrió un error inesperado. Intente de nuevo.';

        if (err.error && typeof err.error === 'object' && err.error.message) {
          const serverMessage = err.error.message.toLowerCase();
          
          if (serverMessage.includes('usuario inactivo')) {
              mensajeAmostrar = 'Usuario inactivo. No tiene permisos para acceder.';
          } else if (serverMessage.includes('credenciales inválidas') || err.status === 401) {
              mensajeAmostrar = 'Email o contraseña incorrectos.';
          }
        } 
        else if (typeof err.error === 'string' && err.error.toLowerCase().includes('usuario inactivo')) {
              mensajeAmostrar = 'Usuario inactivo. No tiene permisos para acceder.';
        }
        else if (err.status === 401 || err.status === 403) {
          mensajeAmostrar = 'Email o contraseña incorrectos.';
        }
        
        // Asignar el mensaje correcto y MOSTRAR EN SNACKBAR
        //this.mensajeError = mensajeAmostrar; 
        this.mostrarErrorEnSnackbar(mensajeAmostrar);
      }
    });
}

// Opcional: Crear una función auxiliar para simplificar el código
private mostrarErrorEnSnackbar(mensaje: string): void {
    this.snackBar.open(mensaje, '', {
        duration: 5000,
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
    });
}
}
