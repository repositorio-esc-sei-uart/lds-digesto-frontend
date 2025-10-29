import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { User, UserProfile } from '../interfaces/user-model';
import { EstadoUsuario } from '../interfaces/status-user-model';
import { Rol } from '../interfaces/role-user-model';

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

  // Datos cargados desde el backend
  private users: UserProfile[] = [];
  private estados: EstadoUsuario[] = [];
  private roles: Rol[] = [];

  // BehaviorSubject para notificar cambios
  private usersSubject = new BehaviorSubject<UserProfile[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  /**
   * Carga inicial de usuarios, estados y roles desde el backend.
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
  }

  /**
   * Obtiene todos los usuarios desde el backend.
   */
  getUsers(): Observable<UserProfile[]> {
    return this.users$;
  }

  /**
   * Obtiene un usuario específico por su ID desde el backend.
   */
  getUserById(id: number): Observable<UserProfile | undefined> {
    return this.http.get<UserProfile>(`${this.usersUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`❌ Error al obtener usuario con ID ${id}`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Crea un nuevo usuario en el backend.
   */
    createUser(newUser: User): Observable<User> {
      return this.http.post<User>(this.usersUrl, newUser);
    }

  /**
   * Accesos a estados y roles cargados.
   */
  getEstados(): EstadoUsuario[] {
    return this.estados;
  }

  getRoles(): Rol[] {
    return this.roles;
  }
}
