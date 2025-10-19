import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, delay, Observable, of, tap, throwError } from 'rxjs';

/**
 * @interface UserProfile
 * Representa los datos del usuario logueado, alineado con tu modelo de datos.
 */
export interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  rol: 'Administrador' | 'Editor';
  estado: 'Activo' | 'Suspendido' | 'Baneado';
}

/**
 * @interface AuthResponse
 * Define la estructura de la respuesta del endpoint de autenticación.
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
}

// Se crea un tipo interno para la base de datos simulada que incluye la contraseña.
// Esto soluciona el error de tipado y es una buena práctica de seguridad.
type MockUser = UserProfile & { password?: string };

/**
 * @Injectable
 * Servicio centralizado para gestionar la autenticación en toda la aplicación.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  /**
   * INTERRUPTOR PRINCIPAL:
   * - true: Usa la simulación (mock) de este archivo.
   * - false: Intenta hacer la llamada real al backend.
   */
  private useMockData = true;

  /** URL del endpoint de autenticación real. */
  private apiUrl = 'https://api.tu-backend.com/auth/login';

  // Un BehaviorSubject que almacena y emite el perfil del usuario actual.
  // Empieza como 'null' porque al inicio nadie está logueado.
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);

  // Un Observable que los componentes pueden sintonizar.
  public currentUser$ = this.currentUserSubject.asObservable();

  // Base de datos simulada con diferentes roles y estados.
  private mockUserDatabase: MockUser[] = [
    { id: 1, nombre: 'Admin', apellido: 'Dev', email: 'admin@unpa.edu.ar', legajo: 'admin', password: 'admin', rol: 'Administrador', estado: 'Activo' },
    { id: 2, nombre: 'Editor', apellido: 'Dev', email: 'editor@unpa.edu.ar', legajo: 'editor', password: 'editor', rol: 'Editor', estado: 'Activo' },
    { id: 3, nombre: 'Jorgito', apellido: 'Gpt', email: 'editor@unpa.edu.ar', legajo: 'jorgito', password: 'jorgito', rol: 'Editor', estado: 'Suspendido' }
  ];

  constructor(private http: HttpClient) {
    // Al iniciar el servicio, intenta cargar al usuario desde localStorage.
    // Esto mantiene la sesión activa si el usuario refresca la página.
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  /**
   * @method login
   * Intenta autenticar a un usuario, delegando a la simulación o a la llamada real.
   */
  login(credentials: { credential?: string | null, password?: string | null }): Observable<AuthResponse> {
    /*if (this.useMockData) {
      return this.loginMock(credentials);
    } else {
      // --- BLOQUE PARA EL BACKEND REAL ---
      // Cuando estés listo, simplemente cambia 'useMockData' a 'false'.
      return this.http.post<AuthResponse>(this.apiUrl, credentials).pipe(
        catchError(this.handleError)
      );
    } se comenta este bloque para probar nueva gestión de sesión*/

    const loginObservable = this.useMockData
      ? this.loginMock(credentials)
      : this.http.post<AuthResponse>(this.apiUrl, credentials).pipe(catchError(this.handleError));

    return loginObservable.pipe(
      tap(response => {
        if (response.success && response.user) {
          // Si el login es exitoso, guardamos en localStorage y ANUNCIAMOS el nuevo usuario.
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    // Se elimina al usuario de localStorage y se ANUNCIA que ya no hay nadie logueado.
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Se expone el valor actual del usuario para comprobaciones síncronas.
  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * @method loginMock (Privado)
   * Simula la lógica completa de un endpoint de login:
   * 1. Busca al usuario.
   * 2. Valida la contraseña.
   * 3. Verifica el estado del usuario.
   */
  private loginMock(credentials: { credential?: any, password?: any }): Observable<AuthResponse> {
    const { credential, password } = credentials;

    // Se busca al usuario por legajo o por email.
    const userFound = this.mockUserDatabase.find(
      user => (user.legajo === credential || user.email === credential)
    );

    // Caso 1: Usuario no encontrado o contraseña incorrecta.
    if (!userFound || userFound.password !== password) {
      const response: AuthResponse = { success: false, message: 'El legajo/email o la contraseña son incorrectos.' };
      return of(response).pipe(delay(1500));
    }

    // Caso 2: Usuario encontrado, se verifica su estado.
    if (userFound.estado !== 'Activo') {
      const response: AuthResponse = { success: false, message: `Acceso denegado. Su cuenta se encuentra en estado: ${userFound.estado}.` };
      return of(response).pipe(delay(1500));
    }

    // Caso 3: Éxito. Usuario válido y activo.
    const { password: userPassword, ...userProfile } = userFound; // Se omite la contraseña en la respuesta.
    const response: AuthResponse = {
      success: true,
      message: 'Login exitoso.',
      token: `fake-jwt-token-for-${userProfile.rol.toLowerCase()}-${userProfile.id}`,
      user: userProfile
    };
    return of(response).pipe(delay(1500));
  }

  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error en la llamada HTTP:', error);
    return throwError(() => new Error('Error de comunicación con el servidor. Intente más tarde.'));
  }
}
