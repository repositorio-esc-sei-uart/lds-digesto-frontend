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
  /* public users$!: Observable<UserProfile[]>;*/
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
   /*this.users$ = this.userService.getUsers();*/
  this.userService.getUsers().subscribe(usuarios => {
        this.dataSource.data = usuarios; // Asignamos el array al DataSource
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
       /* console.log(`✅ Usuario ID ${newUser.idUsuario} creado. Recargando tabla...`);
        this.loadUsers(); // 👈 recarga la tabla*/
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
   *"Confirmar eliminación"
   * 1. Muestra un diálogo de confirmación personalizado.
   * 2. Si se confirma, llama al servicio para eliminar el usuario.
   * 3. Si se elimina con éxito, refresca la tabla.
   */
  onDelete(userId: number, userName: string): void {
    
    // Tarea: "Front de confirmación" (Llamar al nuevo diálogo)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        message: `¿Estás seguro de que deseas eliminar al usuario ${userName}? Esta acción no se puede deshacer.` 
      }
    });

    // Tarea: "Confirmar eliminación" (la lógica)
    // Nos suscribimos a la respuesta del diálogo
    dialogRef.afterClosed().subscribe(result => {
      
      // El diálogo devuelve 'true' si se hizo clic en "Eliminar"
      if (result === true) { 
        this.isLoading = true; // (Opcional) Muestra un spinner
        
        // Llama al servicio para borrar
        this.userService.eliminarUsuario(userId).subscribe({
          next: () => {
            console.log(`Usuario ID ${userId} eliminado.`);
            // (Opcional: Mostrar un mensaje de éxito "toast")
            
            // Tarea: "Actualizar" (Refrescar la lista en pantalla)
            // No necesitas this.loadUsers() si tu servicio actualiza el Subject
            this.snackBar.open(`¡Usuario ${userName} eliminado con éxito!`, '', {
            duration: 3000,
            horizontalPosition: 'right', // O 'center' según tus preferencias
            panelClass: ['success-snackbar']  
           });
          },
          error: (err: any) => {
          // 👇 La variable 'errorMessage' se declara y usa aquí.
            const errorMessage = err.error?.message || 'Error al eliminar el usuario. Inténtalo de nuevo.'; 
            console.error('Error al eliminar el usuario:', err);
            this.isLoading = false; 

            this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'right',
            panelClass: ['error-snackbar'] // Usamos la clase de error
          });
          }
        });
      } else {
        // Si el usuario hizo clic en "Cancelar" (o 'false')
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


abrirFormulario(user: UserProfile): void {
  this.userService.obtenerTodoPorId(user.idUsuario).subscribe((data: UsuarioUpdateDTO) => {
    
    // ... (Tu lógica de transformación del usuario, se mantiene igual)
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

    // 1. Abrir el diálogo y guardar la referencia
    const dialogRef = this.dialog.open(UserEditComponent, {
      data: usuarioTransformado,
      width: '600px', // Añadido para consistencia con goToNewUser
      disableClose: true // Añadido para consistencia con goToNewUser
    });
    
    // 2. Suscribirse al evento de cierre del diálogo
    dialogRef.afterClosed().subscribe(result => {
      // Asumimos que el diálogo devuelve 'true' o el objeto actualizado 
      // si la edición fue exitosa.
      if (result) {
        // El servicio ya emitió el cambio a usersSubject, pero esta línea
        // puede ser útil para forzar la actualización inmediata de la tabla
        // si se usan características como paginación o filtros.
        // PERO: Lo más limpio es confiar en el BehaviorSubject.
        
        // Simplemente logueamos, la actualización de la tabla la maneja
        // automáticamente la suscripción en loadUsers() si el UserService funciona bien.
        console.log('✅ Edición completada. El BehaviorSubject del servicio actualizó la tabla.');

      }
    });
  });
}


}





