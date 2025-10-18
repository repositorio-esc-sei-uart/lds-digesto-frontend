import { Component } from '@angular/core';
// Módulos de Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

/**
 * @Component
 * Se define el componente encargado de renderizar el pie de página de la aplicación.
 * Es un componente puramente presentacional que muestra información de contacto y enlaces.
 */
@Component({
  selector: 'app-footer-component',
  standalone: true, // Se define como un componente standalone.
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css'
})
export class FooterComponent {
  // Este componente actualmente no requiere lógica interna.
}
