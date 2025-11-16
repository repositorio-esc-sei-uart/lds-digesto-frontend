import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
import { AdvancedSearch } from "../../pages/advanced-search/advanced-search";

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
    ReactiveFormsModule,
    AdvancedSearch
],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: '0' }),
        animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({
          height: '*',
          opacity: '1'
        }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({
          height: '0',
          opacity: '0'
        }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  /** Se utiliza como bandera para controlar la visibilidad de la barra de búsqueda en móviles. */
  isSearchActive = false;

  /** Se instancia un FormControl para gestionar el input de búsqueda de forma reactiva. */
  searchControl = new FormControl('');

  /** Observable que emite el perfil del usuario actualmente autenticado. */
  currentUser$: Observable<UserProfile | null>;

  /** Observable para controlar visibilidad de búsqueda */
  isAuthenticated$: Observable<boolean>;

  isAdvancedSearchOpen = false;
  @ViewChild('searchContainer') searchContainer?: ElementRef;

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
    // Inicializa el observable de autenticación
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
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

  /**
   * Llama al servicio mediador para avisarle al HomeComponent
   * que debe abrir el modal de búsqueda avanzada.
   */
  openAdvanced(): void {
    this.searchService.triggerAdvancedSearch();
  }

  toggleAdvancedSearch(): void {
    this.isAdvancedSearchOpen = !this.isAdvancedSearchOpen;
  }

  closeAdvancedSearch(): void {
    this.isAdvancedSearchOpen = false;
  }

  onAdvancedSearchApplied(filtros: any): void {
    console.log('Header recibió filtros:', filtros); // ⬅️ DEBUG temporal

    // Cierra el dropdown
    this.isAdvancedSearchOpen = false;

    // ⬇️ AGREGAR: Enviar al servicio para que Home lo reciba
    this.searchService.aplicarFiltrosAvanzados(filtros);

    // El componente advanced-search ya maneja el envío al servicio,
    // solo cerramos el dropdown
  }

  // Cerrar dropdown si se hace click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isAdvancedSearchOpen && this.searchContainer) {
      const target = event.target as HTMLElement;
      const clickedInside = this.searchContainer.nativeElement.contains(target);

      // Verifica si el click fue en algún overlay de Material
      const clickedOnOverlay = target.closest('.cdk-overlay-container') !== null ||
                              target.closest('.mat-datepicker-popup') !== null ||
                              target.closest('.mat-select-panel') !== null;

      // Solo cierra si NO fue dentro del container Y NO fue en un overlay
      if (!clickedInside && !clickedOnOverlay) {
        this.closeAdvancedSearch();
      }
    }
  }
}
