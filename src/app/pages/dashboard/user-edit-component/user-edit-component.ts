import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user-service';
import { User, UsuarioUpdateDTO } from '../../../interfaces/user-model';
import { MatGridListModule } from '@angular/material/grid-list';
import { EstadoUsuario } from '../../../interfaces/status-user-model';
import { Rol } from '../../../interfaces/role-user-model';
import { MatSelectModule } from '@angular/material/select';
import { Sector } from '../../../interfaces/sector-model';
import { Cargo } from '../../../interfaces/job-title-user-model';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-user-edit-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatGridListModule,
    MatIconModule
  ],
  templateUrl: './user-edit-component.html',
  styleUrl: './user-edit-component.css'
})
export class UserEditComponent implements OnInit {
  usuarioForm: FormGroup;
  verPassword = false;
  passwordOriginal: string = '';

  roles: Rol[] = [];
  estados: EstadoUsuario[] = [];
  sectores: Sector[] = [];
  cargos: Cargo[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar, // 👈 agregado
    private dialogRef: MatDialogRef<UserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.passwordOriginal = this.data.password ?? '';

    this.usuarioForm = this.fb.group({
      dni: [
    data.dni,
    [
      Validators.required,
      Validators.minLength(7),
      Validators.maxLength(8),
      Validators.pattern(/^\d+$/) // opcional: asegura que sean solo números
    ]
  ],
      nombre: [data.nombre, Validators.required],
      apellido: [data.apellido, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      legajo: [data.legajo, Validators.required],
      rol: [data.rol?.idRol, Validators.required],
      estadoU: [data.estadoU?.idEstadoU, Validators.required],
      sector: [data.sector?.idSector, Validators.required],
      cargo: [data.cargo?.idCargo, Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.roles = this.userService.getRoles();
    this.estados = this.userService.getEstados();

    this.userService.getSectores().subscribe((sectores) => {
      this.sectores = sectores;
    });

    this.userService.getCargos().subscribe((cargos) => {
      this.cargos = cargos;
    });
  }

  confirmar(): void {
    if (!this.usuarioForm.valid) {
      this.usuarioForm.markAllAsTouched();

      // ⚠️ Mensaje flotante para formulario inválido
      this.snackBar.open('Por favor, complete correctamente todos los campos requeridos.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.usuarioForm.value;

    const dtoPlano: UsuarioUpdateDTO = {
      dni: formValue.dni,
      email: formValue.email,
      password: formValue.password?.trim()
        ? formValue.password
        : this.passwordOriginal,
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      legajo: formValue.legajo,
      idRol: formValue.rol,
      idSector: formValue.sector,
      idEstadoU: formValue.estadoU,
      idCargo: formValue.cargo
    };

    this.userService.actualizarUsuario(this.data.idUsuario, dtoPlano).subscribe({
      next: () => {
        // ✅ Mensaje flotante de éxito
        this.snackBar.open(`Usuario "${formValue.nombre} ${formValue.apellido}" actualizado correctamente.`, '', {
          duration: 3000,
          horizontalPosition: 'center',
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);

        let errorMessage = 'Error inesperado al actualizar el usuario. Inténtelo más tarde.';

        // Si el backend envía campos duplicados
        if (err.status === 409 && err.error?.duplicatedFields) {
          const duplicatedFields: string[] = err.error.duplicatedFields;
          const fieldNames = duplicatedFields.map(field => field.toUpperCase());
          const lastField = fieldNames.pop();
          let formattedFields = fieldNames.join(', ');
          if (formattedFields.length > 0) formattedFields += ' y ' + lastField;
          else formattedFields = lastField!;
          errorMessage = `ERROR: Los campos ${formattedFields} ya existen. Por favor, verifique.`;
        } else if (err.error?.message) {
          errorMessage = `Error: ${err.error.message}`;
        }

        // ❌ Mensaje flotante de error
        this.snackBar.open(errorMessage, '', {
          duration: 7000,
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}