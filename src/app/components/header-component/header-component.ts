import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Formularios Reactivos
import { FormControl, ReactiveFormsModule } from '@angular/forms';
// RxJS
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';
// Componentes y Servicios
import { LoginComponent } from '../../pages/login/login';
import { GlobalConfigurationService } from '../../services/global-configuration-service';
import { SearchService } from '../../services/search-service';
import { AuthenticationService } from '../../services/authentication-service';
import { UserProfile } from '../../interfaces/user-model';

/**
 * @Component
 * Se define el componente encargado de renderizar y gestionar la cabecera principal de la aplicación.
 * Incluye el logo, título, barra de búsqueda y acciones de usuario como el acceso.
 */
@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent implements OnInit {

  /** Se utiliza como bandera para controlar la visibilidad de la barra de búsqueda en móviles. */
  isSearchActive = false;

  /** Se instancia un FormControl para gestionar el input de búsqueda de forma reactiva. */
  searchControl = new FormControl('');

  /** Observable que emite el perfil del usuario actualmente autenticado. */
  currentUser$: Observable<UserProfile | null>;

  /**
   * Se inyectan los servicios necesarios para el funcionamiento del componente.
   * @param configService Servicio para obtener la configuración global (logo, títulos).
   * @param dialog Servicio de Angular Material para abrir diálogos modales.
   * @param searchService Servicio para comunicar el término de búsqueda a otros componentes.
   */
  constructor(
    public configService: GlobalConfigurationService,
    public dialog: MatDialog,
    private searchService: SearchService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    // Se inicializa la propiedad 'currentUser$' en el constructor,
    // asignándole el observable del servicio de autenticación.
    this.currentUser$ = this.authService.currentUser$;
  }

  /**
   * @LifecycleHook ngOnInit
   * Se ejecuta al iniciar el componente. Se suscribe a los cambios del campo de búsqueda.
   */
  ngOnInit(): void {
    // Se escuchan los cambios en el valor del input de búsqueda.
    this.searchControl.valueChanges.pipe(
      // Se espera 300ms después de que el usuario deja de escribir para evitar peticiones excesivas.
      debounceTime(300),
      // Se emite el valor solo si es diferente al anterior, optimizando el rendimiento.
      distinctUntilChanged()
    ).subscribe((value: string | null) => {
      // Se notifica al servicio de búsqueda con el nuevo término.
      this.searchService.actualizarBusqueda(value || '');
    });
  }

  /**
   * Se ejecuta al hacer clic en el ícono de búsqueda en la vista móvil.
   * Cambia el estado de visibilidad de la barra de búsqueda.
   */
  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    // Si la búsqueda se está cerrando, se limpia el valor del input.
    if (!this.isSearchActive) {
      this.searchControl.setValue('');
    }
  }

  /**
   * Se abre el diálogo modal para el inicio de sesión.
   */
  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '500px',
      // Es una buena práctica deshabilitar el cierre al hacer clic fuera.
      disableClose: false
    });

    // El Header se queda "escuchando" hasta que el diálogo se cierre.
    dialogRef.afterClosed().subscribe(result => {
      // El LoginComponent nos enviará 'true' si el login fue exitoso.
      if (result === true) {
        console.log('HeaderComponent: El login fue exitoso. Navegando al dashboard...');
        // Si fue exitoso, el Header se encarga de redirigir al usuario.
        this.router.navigate(['/dashboard']);
      }
    });
  }

  /**
   * Llama al servicio para cerrar la sesión del usuario.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  /**
   * Se actualiza el método para que navegue a la ruta '/login'.
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
