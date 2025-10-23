
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs'; // 👈 Importante para el patrón reactivo

// Módulos de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Servicios, Interfaces y Componentes
import { UserService } from '../../../services/user-service'; // 👈 Tu servicio
import { User } from '../../../interfaces/user-model'; // 👈 Tu interfaz de usuario
import { UserCreateComponent } from './user-create-component/user-create-component'; // 👈 Para abrir el diálogo

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
  // Columnas que mostrará la tabla
  displayedColumns: string[] = ['id', 'nombreCompleto', 'email', 'estado', 'acciones'];

  // 🚨 Usamos un Observable para la fuente de datos. 
  // Esto es la clave de la reactividad.
  public users$!: Observable<User[]>; 
  
  // No necesitamos 'isLoading' de forma explícita si el Observable tarda en emitir
  // ya que el 'async pipe' esperará el primer valor. Pero lo mantendremos para un indicador.
  isLoading = true; 

  constructor(
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog // Para abrir modales
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Conecta el Observable del servicio al Observable local (users$).
   */
  loadUsers(): void {
    // 🚨 ASIGNACIÓN REACTIVA: Nos conectamos al stream del BehaviorSubject.
    this.users$ = this.userService.getUsers();
    
    // Opcional: Para controlar el indicador de carga solo en la primera emisión
    this.users$.subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false 
    });
  }

  /**
   * Abre el diálogo para crear un nuevo usuario.
   */
  goToNewUser(): void {
    const dialogRef = this.dialog.open(UserCreateComponent, {
      width: '600px',
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe(newUser => {
      if (newUser) {
        // ✅ ÉXITO: El UserService ya llamó a usersSubject.next(), 
        // por lo que el Observable users$ ya está actualizado. ¡No se requiere recarga!
        console.log(`Usuario ID ${newUser.id} creado y tabla actualizada automáticamente.`);
      }
    });
  }

  /**
   * Navega a la ruta de edición.
   */
  goToEdit(userId: number): void {
    this.router.navigate(['/dashboard/user-edit', userId]);
  }

  /**
   * Lógica de eliminación (ejemplo).
   */
  onDelete(userId: number, userName: string): void {
    // Implementar MatDialog o confirmación aquí
    console.warn(`(WIP) Se solicitó eliminar al usuario ID: ${userId} (${userName})`);
  }

  /**
   * Devuelve una clase CSS basada en el ID/nombre del estado.
   */
  getStatusClass(status: number | string): string {
    // Tendrías que adaptar esto según el ID de estado de tu interfaz 'EstadoUsuario'
    if (status === 1 || status === 'activo') {
      return 'status-active';
    } else if (status === 2 || status === 'inactivo') {
      return 'status-inactive';
    }
    return 'status-pending';
  }
}