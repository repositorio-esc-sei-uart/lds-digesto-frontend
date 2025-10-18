/**
 * @fileoverview Componente raíz de la aplicación.
 * @description Es el componente principal que sirve como contenedor para todas
 * las demás vistas y componentes de la aplicación.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header-component/header-component';
import { FooterComponent } from "./components/footer-component/footer-component";

/**
 * @Component
 * Se decora la clase para definirla como un componente de Angular.
 */
@Component({
  selector: 'app-root',            // Se define el selector CSS para usar este componente en `index.html`.
  standalone: true,                 // Se indica que es un componente standalone.
  imports: [                        // Se importan los módulos y componentes necesarios para la plantilla.
    RouterOutlet,                   // Necesario para que el enrutamiento funcione.
    HeaderComponent,                // Se importa el componente de la cabecera.
    FooterComponent                 // Se importa el componente del pie de página.
  ],
  templateUrl: './app.html',        // Se asocia el archivo de la plantilla HTML.
  styleUrl: './app.css'             // Se asocia el archivo de estilos CSS.
})
export class App {
  // TODO: Esta propiedad no se está utilizando actualmente.
  // Se podría usar en el futuro para, por ejemplo, establecer el título de la pestaña del navegador.
  title = 'digesto';
}
