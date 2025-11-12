import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Angular Material
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../../../services/user-service';

// Interfaz para catálogos
interface LookupData {
  idCargo?: number;
  idRol?: number;
  idSector?: number;
  idEstadoU?: number;
  nombre: string;
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
  isLoading: boolean = false;

  roles$!: Observable<LookupData[]>;
  sectores$!: Observable<LookupData[]>;
  cargos$!: Observable<LookupData[]>;
  estados$!: Observable<LookupData[]>;

  private ROLES_URL = 'http://localhost:8080/api/v1/roles';
  private SECTORES_URL = 'http://localhost:8080/api/v1/sectores';
  private CARGOS_URL = 'http://localhost:8080/api/v1/cargos';
  private ESTADOS_URL = 'http://localhost:8080/api/v1/estadosU';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<UserCreateComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLookupData();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dni: [null, [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      legajo: ['', [Validators.required, Validators.pattern(/^[0-9\/-]+$/)]],
      idRol: [null, Validators.required],
      idSector: [null, Validators.required],
      idCargo: [null, Validators.required],
      idEstadoU: [null, Validators.required]
    });
  }

  private loadLookupData(): void {
    const handleError = (url: string) => (err: any) => {
      console.error(`Error al cargar datos de ${url}:`, err);
      return of([]);
    };

    this.roles$ = this.http.get<LookupData[]>(this.ROLES_URL).pipe(catchError(handleError(this.ROLES_URL)));
    this.sectores$ = this.http.get<LookupData[]>(this.SECTORES_URL).pipe(catchError(handleError(this.SECTORES_URL)));
    this.cargos$ = this.http.get<LookupData[]>(this.CARGOS_URL).pipe(catchError(handleError(this.CARGOS_URL)));
    this.estados$ = this.http.get<LookupData[]>(this.ESTADOS_URL).pipe(catchError(handleError(this.ESTADOS_URL)));
  }

// En tu archivo UserCreateComponent.ts
// ...

// En tu archivo UserCreateComponent.ts

onSubmit(): void {
    if (this.isLoading) return;

    if (this.userForm.valid) {
        this.isLoading = true;
        const newUserPayload = this.userForm.value;

        this.userService.createUser(newUserPayload).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.dialogRef.close(response);

                const nombreCompleto = `${newUserPayload.nombre} ${newUserPayload.apellido}`;

                this.snackBar.open(`El usuario "${nombreCompleto}" creado con éxito`, '', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    panelClass: ['success-snackbar']
                });
            },
            error: (err) => {
                this.isLoading = false;

                let errorMessage: string = ' Error inesperado al crear el usuario. Inténtelo más tarde.';

                // Paso clave: Detectar error 409 y leer la lista de campos duplicados
                if (err.status === 409 && err.error?.duplicatedFields && err.error.duplicatedFields.length > 0) {

                    const duplicatedFields: string[] = err.error.duplicatedFields;

                    // 1. Mapear y Formatear los nombres de los campos (EMAIL -> GMAIL)
                    const fieldNames = duplicatedFields.map(field => {
                        return field.toUpperCase() === 'EMAIL' ? 'GMAIL' : field.toUpperCase();
                    });

                    // 2. Construir el mensaje combinado (ej: "DNI y LEGAJO", o "DNI, GMAIL y LEGAJO")
                    const lastField = fieldNames.pop();
                    let formattedFields = fieldNames.join(', ');

                    if (formattedFields.length > 0) {
                        formattedFields += ' y ' + lastField;
                    } else {
                        formattedFields = lastField!;
                    }

                    // 🎯 Mensaje Específico
                    errorMessage = `ERROR: Los campos ${formattedFields} ya existen. Por favor, verifique.`;

                } else if (err.error?.message) {
                     // Fallback para otros errores de validación con mensaje
                     errorMessage = `Error: ${err.error.message}`;
                }

                console.error('Error al crear usuario:', err);

                // 3. Mostrar la notificación de error
                this.snackBar.open(errorMessage, '', {
                    duration: 7000, // Tiempo extendido para leer el error
                    horizontalPosition: 'center',
                    panelClass: ['error-snackbar']
                });
            }
        });
    } else {
        console.warn('⚠️ Formulario inválido.');
        this.userForm.markAllAsTouched();
        // ⚠️ Notificación de advertencia de formulario inválido
        this.snackBar.open('Por favor, complete correctamente todos los campos requeridos.', 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'center',
            panelClass: ['error-snackbar']
        });
    }
}

  onCancel(): void {
    this.dialogRef.close();
  }

  // trackBy para rendimiento
  trackByIdRol(index: number, item: LookupData): number | undefined {
    return item.idRol;
  }

  trackByIdEstadoU(index: number, item: LookupData): number | undefined {
    return item.idEstadoU;
  }

  trackByIdSector(index: number, item: LookupData): number | undefined {
    return item.idSector;
  }

  trackByIdCargo(index: number, item: LookupData): number | undefined {
    return item.idCargo;
  }
}
