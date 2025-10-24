import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Sector } from '../../../../interfaces/sector-model';
import { Cargo } from '../../../../interfaces/job-title-user-model';
import { Rol } from '../../../../interfaces/role-user-model';
import { EstadoUsuario } from '../../../../interfaces/status-user-model';
import { SectorService } from '../../../../services/sector-service';
import { CargoService } from '../../../../services/cargo-service';
import { RolService } from '../../../../services/rol-service';
import { EstadoUserService } from '../../../../services/estadoUser-service';
import { UserService } from '../../../../services/user-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../interfaces/user-model';

@Component({
  selector: 'app-user-form',
  imports: [],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
  userForm!: FormGroup;
  isLoading= false;
  isEditMode!: boolean;

  sectores$!: Observable<Sector[]>;
  cargos$!: Observable<Cargo[]>;
  roles$!: Observable<Rol[]>;
  estados$!: Observable<EstadoUsuario[]>;


constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserForm>,

    // Servicios para cargar las listas desplegables
    private sectorService: SectorService,
    private cargoService: CargoService,
    private rolService: RolService,
    private estadoUsuarioService: EstadoUserService, // Servicio para los estados del usuario

    // Servicio principal para guardar o actualizar el usuario
    private userService: UserService,

    // Inyectamos los datos pasados al diálogo
    @Inject(MAT_DIALOG_DATA) public data: { isEditMode: boolean; usuario?: User }
  ) {
 }  

 ngOnInit():void{
  this.sectores$=this.sectorService.getSectores();
  this.cargos$= this.cargoService.getCargo();
  this.estados$= this.estadoUsuarioService.getEstadoUser();
  this.roles$= this.rolService.getRol();
 }
 }