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
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  mensajeError = ''; // 👈 NUEVA propiedad visible en pantalla

  constructor(
    public configService: GlobalConfigurationService,
    private fb: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
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
    this.mensajeError = ''; // limpia mensaje anterior

    this.authService.login(this.loginForm.value)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.loginForm.enable();
      }))
      .subscribe({
        next: (response: AuthResponse) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            try {
              const payload = JSON.parse(atob(response.token.split('.')[1]));
              localStorage.setItem('currentUser', JSON.stringify(payload));
              console.log('Login exitoso. Usuario:', payload.nombre, 'Rol:', payload.rol);
            } catch (e) {
              console.error('Error al decodificar token:', e);
            }
            this.dialogRef.close(true);
          } else {
            this.mensajeError = 'Email o contraseña incorrectos.';
          }
        },
        error: (err) => {
          console.error('Error completo:', err);

          const mensajeError =
            err.message?.includes('Credenciales inválidas') ? 'Email o contraseña incorrectos.' :
            err.message?.includes('Acceso denegado') ? err.message :
            err.status === 401 || err.status === 403 ? 'Email o contraseña incorrectos.' :
            err.status === 500 ? 'Email o contraseña incorrectos' :
            'Email o contraseña incorrectos';

          this.mensajeError = mensajeError; // 👈 Mostrar mensaje en pantalla
        }
      });
  }
}
