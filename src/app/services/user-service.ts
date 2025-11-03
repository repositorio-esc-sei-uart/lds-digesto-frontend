import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { User, UserProfile, UsuarioUpdateDTO } from '../interfaces/user-model';
import { EstadoUsuario } from '../interfaces/status-user-model';
import { Rol } from '../interfaces/role-user-model';
import { Sector } from '../interfaces/sector-model';
import { Cargo } from '../interfaces/job-title-user-model';

/**
 * Servicio centralizado para la gestión de usuarios.
 * Conectado al backend Java vía HTTP.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Endpoints reales del backend
  private usersUrl = 'http://localhost:8080/api/v1/usuarios';
  private estadosUrl = 'http://localhost:8080/api/v1/estadosU';
  private rolUrl = 'http://localhost:8080/api/v1/roles';
  private cargoUrl = 'http://localhost:8080/api/v1/cargos';
  private sectorUrl = 'http://localhost:8080/api/v1/sectores';

  // Datos cargados desde el backend
  private users: UserProfile[] = [];
  private estados: EstadoUsuario[] = [];
  private roles: Rol[] = [];
  private cargos: Cargo[] = [];
  private sectores: Sector[] = [];

  // BehaviorSubject para notificar cambios
  private usersSubject = new BehaviorSubject<UserProfile[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  /**
   * Carga inicial de usuarios, estados, roles, cargos y sectores desde el backend.
   */
  private loadInitialData(): void {
    this.http.get<UserProfile[]>(this.usersUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar usuarios desde backend', error);
        this.usersSubject.next([]);
        return of([]);
      }),
      tap((usersData) => {
        this.users = usersData;
        this.usersSubject.next([...this.users]);
        console.log(`[UserService] 💾 ${this.users.length} usuarios cargados.`);
      })
    ).subscribe();

    this.http.get<EstadoUsuario[]>(this.estadosUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar estados de usuario', error);
        return of([]);
      }),
      tap((estadosData) => {
        this.estados = estadosData;
        console.log(`[UserService] 📑 ${this.estados.length} estados cargados.`);
      })
    ).subscribe();

    this.http.get<Rol[]>(this.rolUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar roles de usuario', error);
        return of([]);
      }),
      tap((rolesData) => {
        this.roles = rolesData;
        console.log(`[UserService] 🎭 ${this.roles.length} roles cargados.`);
      })
    ).subscribe();

    this.http.get<Cargo[]>(this.cargoUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar cargos de usuario', error);
        return of([]);
      }),
      tap((cargosData) => {
        this.cargos = cargosData;
        console.log(`[UserService] 🧱 ${this.cargos.length} cargos cargados.`);
      })
    ).subscribe();

    this.http.get<Sector[]>(this.sectorUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar sectores de usuario', error);
        return of([]);
      }),
      tap((sectoresData) => {
        this.sectores = sectoresData;
        console.log(`[UserService] 🏢 ${this.sectores.length} sectores cargados.`);
      })
    ).subscribe();
  }

  /** Obtiene todos los usuarios desde el backend. */
  getUsers(): Observable<UserProfile[]> {
    return this.users$;
  }

  /** Obtiene un usuario específico por su ID desde el backend. */
  getUserById(id: number): Observable<UserProfile | undefined> {
    return this.http.get<UserProfile>(`${this.usersUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ Error al obtener usuario con ID ${id}`, error);
        return of(undefined);
      })
    );
  }

/** Crea un nuevo usuario en el backend y actualiza la lista local. */
createUser(newUser: User): Observable<User> {
  return this.http.post<User>(this.usersUrl, newUser).pipe(
    // 1. Usa 'tap' para interceptar la respuesta exitosa del servidor.
    tap((createdUser: User) => {
// 1. Mapear el usuario simple a UserProfile, manejando posibles 'undefined'
      const newUserProfile: UserProfile = {
        // Campos directos...
        idUsuario: createdUser.idUsuario,
        legajo: createdUser.legajo,
        nombre: createdUser.nombre,
        apellido: createdUser.apellido,
        email: createdUser.email,
        
        // 2. Rellenar Rol y Estado buscando por ID:
        // Usamos '?.' para acceder al ID (previniendo el error 18048)
        // y usamos '?? undefined' si la búsqueda falla o si la lista estaba vacía.
        rol: this.roles.find(r => r.idRol === createdUser.rol?.idRol) ?? undefined,
        estadoU: this.estados.find(e => e.idEstadoU === createdUser.estadoU?.idEstadoU) ?? undefined,
        
      };
      
      // 2. Agrega el nuevo usuario al array local
      this.users.push(newUserProfile); // Usamos unshift para que aparezca primero

      // 3. Notifica a todos los suscriptores (la tabla) del nuevo array de usuarios.
      // Creamos una nueva copia para asegurar que Angular detecte el cambio.
      this.usersSubject.next([...this.users]);
      
      console.log(`[UserService] ✅ Usuario ${newUserProfile.idUsuario} creado y lista actualizada.`);
    })
  );
}

  /** Actualiza un usuario existente en el backend. */
actualizarUsuario(id: number, datos: UsuarioUpdateDTO): Observable<any> {
  return this.http.put(`${this.usersUrl}/${id}`, datos);
}




  /** Obtiene un usuario completo (plano) por ID. */
  obtenerTodoPorId(id: number): Observable<UsuarioUpdateDTO> {
    return this.http.get<UsuarioUpdateDTO>(`${this.usersUrl}/all/${id}`);
  }

  /** Accesos a datos precargados */
  getEstados(): EstadoUsuario[] {
    return [...this.estados];
  }

  getRoles(): Rol[] {
    return [...this.roles];
  }

  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.cargoUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar cargos desde backend', error);
        return of([]);
      }),
      tap((cargosData) => {
        this.cargos = cargosData;
        console.log(`[UserService] 🧱 ${this.cargos.length} cargos cargados.`);
      })
    );
  }

  getSectores(): Observable<Sector[]> {
    return this.http.get<Sector[]>(this.sectorUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar sectores desde backend', error);
        return of([]);
      }),
      tap((sectoresData) => {
        this.sectores = sectoresData;
        console.log(`[UserService] 🏢 ${this.sectores.length} sectores cargados.`);
      })
    );
  }
}