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
    ReactiveFormsModule // Se importa para poder usar formularios reactivos.
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  /** Se declara la propiedad que contendrá la instancia del formulario reactivo. */
  loginForm: FormGroup;

  /**
   * Se inyectan las dependencias.
   * @param configService Para acceder a configuraciones globales.
   * @param fb Servicio para construir formularios reactivos de manera simplificada.
   */
  constructor(public configService: GlobalConfigurationService, private fb: FormBuilder) {
    // Se inicializa el formulario con sus controles y validadores.
    this.loginForm = this.fb.group({
      credential: ['', Validators.required], // Campo requerido.
      password: ['', Validators.required]    // Campo requerido.
    }, { updateOn: 'submit' }); // Se configura para que las validaciones se actualicen al enviar.
  }

  /**
   * @method onSubmit
   * Se ejecuta cuando el usuario envía el formulario.
   * Valida las credenciales y muestra un error si son incorrectas.
   */
  onSubmit() {
    // Se procede solo si el formulario cumple con todas las validaciones.
    if (this.loginForm.valid) {
      const { credential, password } = this.loginForm.value;
      // TODO: Reemplazar esta lógica con una llamada a un servicio de autenticación real.
      const adminCredential = 'admin';
      const adminPassword = 'admin';

      // Se simula la comprobación de credenciales.
      if (credential === adminCredential && password === adminPassword) {
        console.log('¡Login exitoso! Bienvenido, Admin.');
        // En un caso real, aquí se cerraría el diálogo y se gestionaría el estado de la sesión.
      } else {
        // Si las credenciales son incorrectas, se establece un error personalizado en el formulario.
        this.loginForm.setErrors({ invalidCredentials: true });
      }
    }
  }
}
