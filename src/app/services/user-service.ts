import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { 
  BehaviorSubject, 
  catchError, 
  Observable, 
  of, 
  tap, 
  throwError,
  forkJoin, // ✅ IMPORTADO
  switchMap, // ✅ IMPORTADO
  map // ✅ IMPORTADO
} from 'rxjs';
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
   * Nota: Se mantienen las suscripciones separadas para no bloquear la carga de usuarios.
   */
  private loadInitialData(): void {
    // 1. Carga de Usuarios (actualiza el BehaviorSubject)
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

    // 2. Carga de datos de catálogo (necesarios para el mapeo, se cargan en arrays privados)
    this.http.get<EstadoUsuario[]>(this.estadosUrl).pipe(
      catchError((error: HttpErrorResponse) => { console.error('❌ Error al cargar estados de usuario', error); return of([]); }),
      tap((estadosData) => { 
        this.estados = estadosData; 
        console.log(`[UserService] 📑 ${this.estados.length} estados cargados.`); 
      })
    ).subscribe();

    this.http.get<Rol[]>(this.rolUrl).pipe(
      catchError((error: HttpErrorResponse) => { console.error('❌ Error al cargar roles de usuario', error); return of([]); }),
      tap((rolesData) => { 
        this.roles = rolesData; 
        console.log(`[UserService] 🎭 ${this.roles.length} roles cargados.`); 
      })
    ).subscribe();

    this.http.get<Cargo[]>(this.cargoUrl).pipe(
      catchError((error: HttpErrorResponse) => { console.error('❌ Error al cargar cargos de usuario', error); return of([]); }),
      tap((cargosData) => { 
        this.cargos = cargosData; 
        console.log(`[UserService] 🧱 ${this.cargos.length} cargos cargados.`); 
      })
    ).subscribe();

    this.http.get<Sector[]>(this.sectorUrl).pipe(
      catchError((error: HttpErrorResponse) => { console.error('❌ Error al cargar sectores de usuario', error); return of([]); }),
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
// En UserService.ts

/** Crea un nuevo usuario en el backend y actualiza la lista local. */
createUser(newUser: User): Observable<User> {
  return this.http.post<User>(this.usersUrl, newUser).pipe(
    // 1. Usar switchMap para cambiar del POST al GET del nuevo usuario
    switchMap(createdUser => {
      const newId = createdUser.idUsuario;

      // 2. Ejecutar GET para obtener el objeto COMPLETO (con Rol y Estado)
      return this.http.get<UserProfile>(`${this.usersUrl}/${newId}`).pipe(
        // Retornar el UserProfile completo
        map(userProfileCompleto => userProfileCompleto)
      );
    }),
    
    // 3. Tap recibe el objeto UserProfile COMPLETO
    tap((newUserProfile: UserProfile) => {
      
      // Ya no necesitamos el mapeo manual, el objeto ya es UserProfile
      
      // Agregar al final de la lista
      this.users.push(newUserProfile);
      
      // Notificar a todos los suscriptores
      this.usersSubject.next([...this.users]);

      console.log(`[UserService] ✅ Usuario ${newUserProfile.idUsuario} creado, cargado completo y lista actualizada.`);
    }),
    
    // 4. Mapear de vuelta a 'User' (o simplemente devolver el observable) 
    // Mantenemos el tipo de retorno si es necesario para el componente.
    map(userProfile => userProfile as User) 
  );
}

// En UserService.ts

/** Actualiza un usuario existente en el backend.
 * Sigue el patrón de: PUT -> switchMap -> GET (Completo) -> tap (Actualiza lista local) -> Notificar.
 */
// En UserService.ts (la versión adaptada)

/** Actualiza un usuario existente en el backend. */
actualizarUsuario(id: number, datos: UsuarioUpdateDTO): Observable<UserProfile> {
  // 1. PUT para actualizar
  return this.http.put<any>(`${this.usersUrl}/${id}`, datos).pipe(
    // 2. switchMap: Cambia al Observable del GET
    switchMap(() => {
      // 3. GET para obtener el UserProfile COMPLETO y actualizado
      return this.http.get<UserProfile>(`${this.usersUrl}/${id}`);
    }),
    
    // 4. Tap para SINCRONIZAR la lista local y notificar a la tabla
    tap((updatedUserProfile: UserProfile) => {
      const index = this.users.findIndex(u => u.idUsuario === updatedUserProfile.idUsuario);
      
      if (index !== -1) {
        // Reemplazar el objeto antiguo por el nuevo UserProfile completo
        this.users[index] = updatedUserProfile; 
        
        // 🔥 ESTO ES LO CRUCIAL: Notificar a la tabla que está suscrita a users$
        this.usersSubject.next([...this.users]);
        
        console.log(`[UserService] ✅ Usuario ${id} actualizado y lista local sincronizada.`);
      } else {
        console.warn(`[UserService] ⚠️ Usuario actualizado (ID ${id}) no encontrado en la lista local.`);
      }
    }),
    
    // 5. El observable final es el UserProfile completo.
    map(userProfile => userProfile)
  );
}

  /** Obtiene un usuario completo (plano) por ID. */
  obtenerTodoPorId(id: number): Observable<UsuarioUpdateDTO> {
    return this.http.get<UsuarioUpdateDTO>(`${this.usersUrl}/all/${id}`);
  }

  /** Accesos a datos precargados (devuelve copias para evitar mutación) */
  getEstados(): EstadoUsuario[] {
    return [...this.estados];
  }

  getRoles(): Rol[] {
    return [...this.roles];
  }
  
  // (El resto de métodos de eliminación y obtención de cargos/sectores se mantienen igual)
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`).pipe(
      tap(() => {
        console.log(`[UserService] Usuario ${id} eliminado. Actualizando estado local.`);
        this.users = this.users.filter(user => user.idUsuario !== id);
        this.usersSubject.next([...this.users]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ Error al eliminar usuario con ID ${id}`, error);
        return throwError(() => error); 
      })
    );
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