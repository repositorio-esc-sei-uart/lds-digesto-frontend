import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { UserProfile, MockUser, AuthResponse } from '../interfaces/user-model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private useMockData = false;
  private apiUrl = 'http://localhost:8080/api/v1/auth/signin';

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private mockUserDatabase: MockUser[] = [
    {
      idUsuario: 1,
      nombre: 'Admin',
      apellido: 'Dev',
      email: 'admin@unpa.edu.ar',
      legajo: 'admin',
      password: 'admin',
      rol: { idRol: 1, nombre: 'Administrador', descripcion: 'Usuario con acceso total al sistema.' },
      estadoU: { idEstadoU: 1, nombre: 'Activo', descripcion: 'La cuenta del usuario está plenamente operativa y en uso.' }
    },
    {
      idUsuario: 2,
      nombre: 'Editor',
      apellido: 'Dev',
      email: 'editor@unpa.edu.ar',
      legajo: 'editor',
      password: 'editor',
      rol: { idRol: 2, nombre: 'Editor', descripcion: 'Usuario encargado de la gestión de documentos.' },
      estadoU: { idEstadoU: 1, nombre: 'Activo', descripcion: 'La cuenta del usuario está plenamente operativa y en uso.' }
    },
    {
      idUsuario: 3,
      nombre: 'Jorgito',
      apellido: 'Gpt',
      email: 'jorgito@unpa.edu.ar',
      legajo: 'jorgito',
      password: 'jorgito',
      rol: { idRol: 3, nombre: 'Lector', descripcion: 'Usuario encargado de Leer.' },
      estadoU: { idEstadoU: 2, nombre: 'Inactivo', descripcion: 'La cuenta del usuario desactivada.' }
    }
  ];

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: UserProfile = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    console.log('Enviando credenciales:', credentials);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const loginObservable = this.useMockData
      ? this.loginMock(credentials)
      : this.http.post<AuthResponse>(this.apiUrl, credentials, { headers }).pipe(catchError(this.handleError));

    return loginObservable.pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);

          try {
            const parts = response.token.split('.');
            if (parts.length !== 3) throw new Error('Token mal formado');

            const payload: UserProfile = JSON.parse(atob(parts[1]));
            console.log('Payload decodificado:', payload);
            console.log('Rol:', payload.rol?.nombre ?? 'Rol no definido');

            localStorage.setItem('currentUser', JSON.stringify(payload));
            this.currentUserSubject.next(payload);
          } catch (e) {
            console.error('Error al decodificar el token:', e);
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  private loginMock(credentials: { email: string; password: string }): Observable<AuthResponse> {
    const { email, password } = credentials;
    const userFound = this.mockUserDatabase.find(user => user.email === email);

    if (!userFound || userFound.password !== password) {
      return throwError(() => new Error('Credenciales inválidas.'));
    }

    if (!userFound.estadoU || userFound.estadoU.nombre !== 'Activo') {
      const estado = userFound.estadoU?.nombre ?? 'desconocido';
      return throwError(() => new Error(`Acceso denegado. Estado: ${estado}`));
    }

    const { password: _, ...userProfile } = userFound;
    const tokenPayload: UserProfile = {
      idUsuario: userProfile.idUsuario,
      nombre: userProfile.nombre,
      apellido: userProfile.apellido,
      email: userProfile.email,
      rol: userProfile.rol,
      legajo: userProfile.legajo,
      estadoU: userProfile.estadoU
    };

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(tokenPayload));
    const signature = 'mocked-signature';

    const token = `${header}.${payload}.${signature}`;
    return of({ token }).pipe(delay(1500));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error completo:', error);
   // return throwError(() => new Error('Error de comunicación con el servidor. Intente más tarde.'));
    return throwError(() => error);
  }

  /**
   * Observable que emite true/false según el estado de autenticación
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user !== null)
    );
  }
}
