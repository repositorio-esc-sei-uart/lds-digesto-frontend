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
    private dialogRef: MatDialogRef<UserEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.passwordOriginal = this.data.password ?? '';

    this.usuarioForm = this.fb.group({
      dni: [data.dni, Validators.required],
      nombre: [data.nombre, Validators.required],
      apellido: [data.apellido, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      legajo: [data.legajo, Validators.required],
      rol: [data.rol?.idRol, Validators.required],
      estadoU: [data.estadoU?.idEstadoU, Validators.required],
      sector: [data.sector?.idSector, Validators.required],
      cargo: [data.cargo?.idCargo, Validators.required],
      password: [''] // campo editable, vacío por defecto
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
    if (this.usuarioForm.valid) {
      const formValue = this.usuarioForm.value;

      const dtoPlano: UsuarioUpdateDTO = {
        dni: formValue.dni,
        email: formValue.email,
        password: formValue.password?.trim()
          ? formValue.password
          : this.passwordOriginal, // ✅ fallback seguro
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        legajo: formValue.legajo,
        idRol: formValue.rol,
        idSector: formValue.sector,
        idEstadoU: formValue.estadoU,
        idCargo: formValue.cargo
      };

      console.log('DTO enviado:', dtoPlano);

      this.userService.actualizarUsuario(this.data.idUsuario, dtoPlano).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error al actualizar usuario:', err)
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
