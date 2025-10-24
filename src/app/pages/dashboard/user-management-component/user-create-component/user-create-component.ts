import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Importamos 'of' para manejo de errores
import { catchError } from 'rxjs/operators'; // Usamos 'catchError' para manejar errores de carga

// IMPORTS DE ANGULAR MATERIAL
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../services/user-service';

// Interfaz para tipar los datos
interface LookupData {
    // ID genérico (usado para sectores, estados, etc. si usan "id")
    id?: number; 
    
    // IDs específicos para los casos que no usan "id"
    idCargo?: number;
    idRol?: number;
    idSector?: number;
    idEstadoU?: number;

    nombre: string;
    // Si tu JSON de cargos tiene 'descripcion', también debería ir aquí
    descripcion?: string;
}

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-create-component.html',
  styleUrls: ['./user-create-component.css']
})
export class UserCreateComponent implements OnInit {

  userForm: FormGroup = new FormGroup({});
  // Renombrado a 'isLoading' para un manejo más claro del submit.
  // Ya no necesitamos 'isLoadingData' ya que el AsyncPipe lo gestiona.
  isLoading: boolean = false;

  // CAMBIO CLAVE: Propiedades como Observables para el AsyncPipe
  roles$!: Observable<LookupData[]>;
  sectores$!: Observable<LookupData[]>;
  cargos$!: Observable<LookupData[]>;
  estados$!: Observable<LookupData[]>;

  private ROLES_URL = 'assets/data/roles.json';
  private SECTORES_URL = 'assets/data/sectors.json';
  private CARGOS_URL = 'assets/data/cargos.json';
  private ESTADOS_URL = 'assets/data/estadosUser.json';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<UserCreateComponent>,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLookupData();
  }

  /**
   * Inicializa el FormGroup. Los selects inician HABILITADOS (el AsyncPipe se encarga).
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      // La validación de la contraseña es clave en la creación.
      password: ['', [Validators.required, Validators.minLength(6)]],
      dni: [null, [Validators.required, Validators.pattern(/^\d{7,10}$/)]],
      legajo: ['', [Validators.required, Validators.pattern(/^[0-9\/-]+$/)]],

      // CORRECCIÓN CLAVE: Se inician como habilitados con valor nulo.
      idRol: [null, Validators.required],
      idSector: [null, Validators.required],
      idCargo: [null, Validators.required],
      idEstado: [null, Validators.required],
    });
  }

  /**
   * Carga los datos de Lookup en los Observables, gestionando errores.
   */
  private loadLookupData(): void {
    // Función de manejo de errores genérica
    const handleError = (url: string) => (err: any) => {
      console.error(`Error al cargar datos de ${url}. Revisar ruta JSON:`, err);
      // Retorna un Observable de array vacío para no bloquear la aplicación
      return of([]);
    };

    // Asignación directa a los Observables
    this.roles$ = this.http.get<LookupData[]>(this.ROLES_URL).pipe(
      catchError(handleError(this.ROLES_URL))
    );
    this.sectores$ = this.http.get<LookupData[]>(this.SECTORES_URL).pipe(
      catchError(handleError(this.SECTORES_URL))
    );
    this.cargos$ = this.http.get<LookupData[]>(this.CARGOS_URL).pipe(
      catchError(handleError(this.CARGOS_URL))
    );
    this.estados$ = this.http.get<LookupData[]>(this.ESTADOS_URL).pipe(
      catchError(handleError(this.ESTADOS_URL))
    );
  }

  /**
   * Envía los datos del formulario al servicio.
   */
  onSubmit(): void {
    if (this.isLoading) return; // Previene doble clic

    if (this.userForm.valid) {
      this.isLoading = true; // Deshabilita el botón
      const newUserPayload = this.userForm.value;
      console.log('Datos a enviar:', newUserPayload);

      this.userService.createUser(newUserPayload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (err) => {
          this.isLoading = false; // Re-habilita el botón en caso de error
          console.error('Error al crear usuario:', err);
          alert('Hubo un error al guardar el usuario.');
        }
      });
    } else {
      console.error('Formulario inválido.');
      this.userForm.markAllAsTouched();
    }
  }

  /**
   * Cierra el diálogo sin guardar.
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}