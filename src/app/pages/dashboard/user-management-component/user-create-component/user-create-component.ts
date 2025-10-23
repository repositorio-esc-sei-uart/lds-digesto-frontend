import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

// 🚨 IMPORTS DE ANGULAR MATERIAL PARA EL FORMULARIO EN EL DIÁLOGO
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../services/user-service';

// 💡 Interfaz para tipar los datos
interface LookupData {
    id: number;
    nombre: string;
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
  isLoadingData: boolean = true; 
  
  // 💡 Tipado de las propiedades que contendrán los datos
  roles: LookupData[] = [];
  sectores: LookupData[] = [];
  cargos: LookupData[] = [];
  estados: LookupData[] = [];
  
  // 💡 Constantes para las URLs de los archivos JSON (Ajusta la ruta si es necesario)
  private ROLES_URL = 'assets/data/roles.json';
  private SECTORES_URL = 'assets/data/sector.json';
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
   * Inicializa la estructura del FormGroup con validadores.
   */
  private initForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      
      // 🚨 NUEVO CAMPO AGREGADO
      password: ['', [Validators.required, Validators.minLength(6)]], 
      
      // 💡 Se mantiene type="number" en HTML para DNI, por eso solo validamos patrón numérico.
      dni: [null, [Validators.required, Validators.pattern(/^\d{7,10}$/)]], 
      
      // 🚨 CORRECCIÓN: Patrón ajustado para Legajo. Permite números, guiones y barras.
      // (Para el formato '1-45383036/23' que mostraste. Si es solo números, usar /^\d+$/)
      legajo: ['', [Validators.required, Validators.pattern(/^[0-9\/-]+$/)]], 
      
      // IDs for Selects
      idRol: [null, Validators.required],
      idSector: [null, Validators.required],
      idCargo: [null, Validators.required],
      idEstado: [null, Validators.required],
    });
    // 💡 El formulario se deshabilita mientras se cargan los datos (clave para el mat-select)
    this.userForm.disable(); 
  }

  /**
   * Carga los datos de los archivos JSON usando forkJoin para peticiones paralelas.
   */
  private loadLookupData(): void {
    this.isLoadingData = true;

    const roles$ = this.http.get<LookupData[]>(this.ROLES_URL).pipe(tap(data => this.roles = data));
    const sectores$ = this.http.get<LookupData[]>(this.SECTORES_URL).pipe(tap(data => this.sectores = data));
    const cargos$ = this.http.get<LookupData[]>(this.CARGOS_URL).pipe(tap(data => this.cargos = data));
    const estados$ = this.http.get<LookupData[]>(this.ESTADOS_URL).pipe(tap(data => this.estados = data));

    forkJoin([roles$, sectores$, cargos$, estados$]).subscribe({
        next: () => {
            console.log('Datos de Lookup cargados correctamente. ¡Listo para interactuar!');
            this.isLoadingData = false;
            // 🚨 CRÍTICO: Habilitar el formulario solo cuando los datos estén listos
            this.userForm.enable(); 
        },
        error: (err) => {
            console.error('Error al cargar datos de Lookup. Revisar rutas JSON:', err);
            this.isLoadingData = false;
            alert('No se pudieron cargar los datos necesarios para el formulario.');
            this.dialogRef.close(); // Cerrar el diálogo si falla la carga
        }
    });
  }

  /**
   * Envía los datos del formulario al servicio.
   */
  onSubmit(): void {
    if (this.isLoadingData) return; // Evitar envío si aún carga

    if (this.userForm.valid) {
      const newUserPayload = this.userForm.value;
      console.log('Datos a enviar:', newUserPayload);
      
      this.userService.createUser(newUserPayload).subscribe({
        next: (response) => {
          this.dialogRef.close(response); 
        },
        error: (err) => {
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