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
      // ... (Mock database sin cambios)
      {
         idUsuario: 1,
         nombre: 'Admin',
         apellido: 'Dev',
         email: 'admin@unpa.edu.ar',
         legajo: 'admin', // Clave de legajo
         password: 'admin',
         rol: { idRol: 1, nombre: 'Administrador', descripcion: 'Usuario con acceso total al sistema.' },
         estadoU: { idEstadoU: 1, nombre: 'Activo', descripcion: 'La cuenta del usuario está plenamente operativa y en uso.' }
      },
      {
         idUsuario: 2,
         nombre: 'Editor',
         apellido: 'Dev',
         email: 'editor@unpa.edu.ar',
         legajo: 'editor', // Clave de legajo
         password: 'editor',
         rol: { idRol: 2, nombre: 'Editor', descripcion: 'Usuario encargado de la gestión de documentos.' },
         estadoU: { idEstadoU: 1, nombre: 'Activo', descripcion: 'La cuenta del usuario está plenamente operativa y en uso.' }
      },
      {
         idUsuario: 3,
         nombre: 'Jorgito',
         apellido: 'Gpt',
         email: 'jorgito@unpa.edu.ar',
         legajo: 'jorgito', // Clave de legajo
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

    // MODIFICACIÓN PRINCIPAL: Cambiar 'email' a 'identifier'
    login(credentials: { identifier: string; password: string }): Observable<AuthResponse> {
        console.log('Enviando credenciales:', credentials);

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        const loginObservable = this.useMockData
            ? this.loginMock(credentials)
            // El backend espera un objeto { identifier: '...', password: '...' }
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
        // ... (sin cambios)
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    public get currentUserValue(): UserProfile | null {
        // ... (sin cambios)
        return this.currentUserSubject.value;
    }

    // MODIFICACIÓN: Lógica de Mock Data para soportar 'identifier' (email o legajo)
    private loginMock(credentials: { identifier: string; password: string }): Observable<AuthResponse> {
        const { identifier, password } = credentials;

        // Función auxiliar para saber si es email (debe ser la misma lógica que en el backend si es posible)
        const isEmail = (input: string) => input && input.includes('@');
        
        // Buscar por email O por legajo
        const userFound = this.mockUserDatabase.find(user => 
            (isEmail(identifier) ? user.email === identifier : user.legajo === identifier)
        );

        if (!userFound || userFound.password !== password) {
            // El error 'Credenciales inválidas' simula la respuesta 401 del backend
            return throwError(() => ({ status: 401, error: { message: 'Credenciales inválidas' } }));
        }

        if (!userFound.estadoU || userFound.estadoU.nombre !== 'Activo') {
            const estado = userFound.estadoU?.nombre ?? 'desconocido';
            // Simula el error de usuario inactivo (403 Forbidden)
            return throwError(() => ({ status: 403, error: { message: `Usuario inactivo` } }));
        }

        const { password: _, ...userProfile } = userFound;
        const tokenPayload: UserProfile = {
            idUsuario: userProfile.idUsuario,
            nombre: userProfile.nombre,
            apellido: userProfile.apellido,
            email: userProfile.email,
            rol: userProfile.rol,
            legajo: userProfile.legajo, // Se incluye el legajo en el payload mock
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
        // Retornar el objeto error para que el componente pueda leer el status (401 o 403)
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