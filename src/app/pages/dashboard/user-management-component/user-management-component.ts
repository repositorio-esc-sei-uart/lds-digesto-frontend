import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

// Servicios, Interfaces y Componentes
import { UserService } from '../../../services/user-service';
import { User, UserProfile, UsuarioUpdateDTO } from '../../../interfaces/user-model';
import { UserCreateComponent } from './user-create-component/user-create-component';
import { UserEditComponent } from '../user-edit-component/user-edit-component';
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-management-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-management-component.html',
  styleUrl: './user-management-component.css'
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['id', 'legajo', 'nombre', 'apellido', 'email', 'rol', 'estado', 'acciones'];
  public dataSource = new MatTableDataSource<UserProfile>();
  isLoading = true;

  constructor(
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios desde el servicio.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(usuarios => {
      this.dataSource.data = usuarios;
      this.isLoading = false;
      console.log(`Componente: Tabla actualizada con ${usuarios.length} usuarios.`);
    });
  }

  /**
   * Abre el diálogo para crear un nuevo usuario y recarga la tabla si se creó.
   */
  goToNewUser(): void {
    const dialogRef = this.dialog.open(UserCreateComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(newUser => {
      if (newUser) {
        console.log(`✅ Usuario creado. La tabla se actualiza automáticamente.`);
      }
    });
  }

  /**
   * Navega a la ruta de edición.
   */
  goToEdit(userId: number): void {
    this.router.navigate(['/dashboard/user-edit', userId]);
    this.userService.getUserById(userId);
  }

  /**
   * Muestra un diálogo de confirmación y elimina al usuario si se confirma.
   */
  onDelete(userId: number, userName: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que deseas eliminar al usuario ${userName}? Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.userService.eliminarUsuario(userId).subscribe({
          next: () => {
            console.log(`Usuario ID ${userId} eliminado.`);

            // Muestra mensaje de éxito
            this.snackBar.open(`¡Usuario ${userName} eliminado con éxito!`, '', {
              duration: 3000,
              horizontalPosition: 'right',
              panelClass: ['success-snackbar']
            });
          },
          error: (err: any) => {
            const errorMessage = err.error?.message || 'Error al eliminar el usuario. Inténtalo de nuevo.';
            console.error('Error al eliminar el usuario:', err);
            this.isLoading = false;

            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'right',
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        console.log('Eliminación cancelada.');
      }
    });
  }

  /**
   * Devuelve una clase CSS basada en el estado del usuario.
   */
  getStatusClass(status: number | string): string {
    if (status === 1 || status === 'Activo') {
      return 'status-active';
    } else if (status === 2 || status === 'Inactivo') {
      return 'status-inactive';
    }
    return 'status-pending';
  }

  /**
   * Abre el diálogo para editar un usuario y muestra la notificación.
   */
  abrirFormulario(user: UserProfile): void {
    this.userService.obtenerTodoPorId(user.idUsuario).subscribe({
      next: (data: UsuarioUpdateDTO) => {
        const usuarioTransformado: User = {
          idUsuario: user.idUsuario,
          dni: data.dni,
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          legajo: data.legajo,
          rol: { idRol: data.idRol, nombre: '' },
          estadoU: { idEstadoU: data.idEstadoU, nombre: '' },
          sector: { idSector: data.idSector, nombre: '' },
          cargo: { idCargo: data.idCargo, nombre: '' }
        };

        const dialogRef = this.dialog.open(UserEditComponent, {
          data: usuarioTransformado,
          width: '600px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
          const nombreCompleto = `${usuarioTransformado.nombre} ${usuarioTransformado.apellido}`;

          if (result) {
            this.snackBar.open(`El usuario "${nombreCompleto}" fue modificado con éxito`, 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              panelClass: ['success-snackbar']
            });
          } else if (result === false) {
            this.snackBar.open(`Operación de edición cancelada`, '', {
              duration: 5000,
              horizontalPosition: 'center',
              panelClass: ['error-snackbar']
            });
          }
        });
      },
      error: (err) => {
        console.error(' Error al obtener los datos del usuario para edición:', err);
        this.snackBar.open(' Error al cargar la información del usuario para editar.', '', {
          duration: 5000,
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}


