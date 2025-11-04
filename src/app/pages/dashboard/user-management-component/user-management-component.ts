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


// Servicios, Interfaces y Componentes
import { UserService } from '../../../services/user-service';
import { User, UserProfile, UsuarioUpdateDTO } from '../../../interfaces/user-model';
import { UserCreateComponent } from './user-create-component/user-create-component';
import { UserEditComponent } from '../user-edit-component/user-edit-component';

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
    public dialog: MatDialog
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
   * Lógica de eliminación (placeholder).
   */
  /**
   * Tarea: "Confirmar eliminación", "Front de confirmación" y "Actualizar base de datos"
   * Se llama al hacer clic en el botón de eliminar.
   * 1. Muestra un diálogo de confirmación.
   * 2. Si se confirma, llama al servicio para eliminar el usuario.
   * 3. Si se elimina con éxito, refresca la tabla.
   */
  onDelete(userId: number, userName: string): void {
    
    // Tarea: "Front de confirmación" (la UI)
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar al usuario ${userName}? Esta acción no se puede deshacer.`);

    // Tarea: "Confirmar eliminación" (la lógica)
    if (confirmacion) {
      
      
      // Llama al servicio (Frontend)
      this.userService.eliminarUsuario(userId).subscribe({
        next: () => {
          console.log(`Usuario ID ${userId} eliminado.`);
          // (Opcional: Mostrar un mensaje de éxito "toast")
          
          // Tarea: "Actualizar" (Refrescar la lista en pantalla)
          this.loadUsers(); // Vuelve a cargar los usuarios
        },
        error: (err: any) => {
          console.error('Error al eliminar el usuario:', err);
          // (Opcional: Mostrar un mensaje de error "toast")
          alert('No se pudo eliminar el usuario.');
          this.isLoading = false; // Oculta el spinner en caso de error
        }
      });
    }
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

    this.dialog.open(UserEditComponent, {
      data: usuarioTransformado
    });
  });
}


}





