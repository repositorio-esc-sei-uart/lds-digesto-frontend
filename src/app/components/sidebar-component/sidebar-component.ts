import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Se importan los módulos de Angular Material para la lista de navegación.
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
// Se importa el servicio de autenticación y la interfaz del perfil de usuario.
import { AuthenticationService } from '../../services/authentication-service';
import { UserProfile } from '../../interfaces/user-model';

/**
 * @Component
 * Define la barra lateral (aside) de la sección del dashboard.
 * Muestra la información del usuario y los enlaces de navegación según su rol.
 */
@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  /**
   * Se declara un Observable para mantener la información del usuario actual.
   * La plantilla se suscribirá a este Observable para mostrar los datos.
   */
  //currentUser$: Observable<UserProfile | null>;

  // --- 5. AÑADIR ESTAS VARIABLES ---
  public isAdmin: boolean = false;
  private userSubscription: Subscription | undefined;
  currentUser$: Observable<UserProfile | null>;

  /**
   * @constructor
   * Se inyecta el AuthenticationService para acceder al estado de la sesión.
   */
  constructor(private authService: AuthenticationService) {
    // Se conecta el Observable local con el 'currentUser$' del servicio de autenticación.
    // A partir de ahora, cualquier cambio en la sesión se reflejará aquí automáticamente.
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(currentUser => {
      this.isAdmin = currentUser?.rol?.nombre === 'Administrador';
    });
  }

  // --- 8. AÑADIR ngOnDestroy ---
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
