// src/app/pages/dashboard/user-management-component/user-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; 
import { UserCreateComponent } from './user-create-component/user-create-component';
import { UserService } from '../../../services/user-service';
import { UserProfile } from '../../../interfaces/user-model';

@Component({
  selector: 'app-user-management',
  standalone: true, // Si tu proyecto es moderno, esto debe ser 'true'
  imports: [
    CommonModule,  // <-- Esto resuelve el error [ngClass]
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './user-management-component.html',
  styleUrls: ['./user-management-component.css']
})
export class UserManagementComponent implements OnInit {

  // Usamos un Observable para que la plantilla maneje las suscripciones (async pipe)
  public users$!: Observable<UserProfile[]>;

  constructor(
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios desde el servicio.
   */
  loadUsers(): void {
    // Asignamos el Observable directamente. El 'async pipe' lo resolverá en el HTML.
    this.users$ = this.userService.getUsers();
  }

 goToNewUser(): void {

    const dialogRef = this.dialog.open(UserCreateComponent, {
    width: '600px', // Define un ancho adecuado para el formulario
    disableClose: true // Opcional: Evita que se cierre haciendo click fuera
    });

    // Manejar el resultado cuando el diálogo se cierra
    dialogRef.afterClosed().subscribe(newUser => {
      console.log('El diálogo de Nuevo Usuario se cerró. Resultado:', newUser);
      if (newUser) {
      // Si hay datos (significa que el usuario se creó exitosamente), recargamos la lista
      this.loadUsers();
      // Opcional: mostrar un Toast o Snackbar de éxito
      }
    });
  }

  /**
   * Navega a la ruta de edición del usuario con el ID especificado.
   */
  goToEdit(userId: number): void {
     // Navega a la ruta de edición, pasando el ID como parámetro
    this.router.navigate(['/dashboard/user-edit', userId]);
  }
}