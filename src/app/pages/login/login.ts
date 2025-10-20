// Se realizan las importaciones de Angular y Angular Material.
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Se importan los módulos de Angular Material necesarios para la plantilla.
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GlobalConfigurationService } from '../../services/global-configuration-service';
import { AuthenticationService } from '../../services/authentication-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthResponse } from '../../interfaces/user-model';

/**
 * @Component
 * Se define el componente para el diálogo de inicio de sesión.
 * Contiene un formulario reactivo para validar las credenciales del usuario.
 */
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
    ReactiveFormsModule, // Se importa para poder usar formularios reactivos.
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  /** Se declara la propiedad que contendrá la instancia del formulario reactivo. */
  loginForm: FormGroup;
  /** Propiedad para controlar el estado de carga. */
  isLoading = false;

  /**
   * Se inyectan las dependencias.
   * @param fb Servicio para construir formularios.
   * @param authService El nuevo servicio para manejar la lógica de autenticación.
   * @param configService Para acceder a configuraciones globales.
   */
  constructor(
    public configService: GlobalConfigurationService,
    private fb: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
    private dialogRef: MatDialogRef<LoginComponent>
  ) {
    // Se inicializa el formulario con sus controles y validadores.
    this.loginForm = this.fb.group({
      credential: ['', Validators.required], // Campo requerido.
      password: ['', Validators.required]    // Campo requerido.
    });
    //}, { updateOn: 'submit' }); // Se configura para que las validaciones se actualicen al enviar.
  }

  /**
   * @method onSubmit
   * Se ejecuta cuando el usuario envía el formulario.
   * Ahora delega la validación de credenciales al AuthService.
   */
  /* onSubmit() { // Se desactiva para ilustrar el uso del servicio.
    if (this.loginForm.valid) {
      // Se llama al método del servicio, pasándole los datos del formulario.
      const fueExitoso = this.authService.login(this.loginForm.value);

      // El componente solo reacciona al resultado.
      if (fueExitoso) {
        console.log('LoginComponent: ¡Login exitoso! Navegando a la página principal...');
        // Aquí iría la lógica para redirigir al usuario, por ejemplo:
        // this.router.navigate(['/dashboard']);
      } else {
        // Si el servicio devuelve 'false', se establece el error.
        this.loginForm.setErrors({ invalidCredentials: true });
      }
    }
  } */


  /**
   * @method onSubmit
   * Ahora maneja un estado de carga mientras espera la respuesta del servicio.
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      return; // Si el formulario no es válido, no se hace nada.
    }

    this.isLoading = true; // Se inicia la carga.
    this.loginForm.disable(); // Se deshabilita el formulario para evitar doble envío.

    // Se llama al servicio y se espera la respuesta del Observable.
    this.authService.login(this.loginForm.value).pipe(
        // finalize() se ejecuta siempre, ya sea éxito o error.
        // Es el lugar perfecto para detener la carga y reactivar el formulario.
        finalize(() => {
          this.isLoading = false;
          this.loginForm.enable();
        })
      )
      .subscribe({
        // El bloque 'next' se ejecuta si la llamada es exitosa.
        next: (response: AuthResponse) => {
          if (response.success) {
            console.log('Login exitoso. Rol:', response.user?.rol);
            this.dialogRef.close(true);
            // this.router.navigate(['/home']);
          } else {
            // Si el backend devuelve success: false, se muestra el mensaje que envía.
            this.loginForm.setErrors({ invalidCredentials: response.message });
          }
        },
        // El bloque 'error' se ejecuta si la llamada falla (ej. error de red).
        error: (err) => {
          console.error('Error en el servicio de login:', err);
          this.loginForm.setErrors({ invalidCredentials: 'Error de conexión. Intente más tarde.' });
        }
      });
  }
}
