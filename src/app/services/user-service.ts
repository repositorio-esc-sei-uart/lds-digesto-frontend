import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, forkJoin, Observable, of, tap } from 'rxjs';
import { User } from '../interfaces/user-model';
import { EstadoUsuario } from '../interfaces/status-user-model';
/**
 * Servicio centralizado para la gestión de usuarios.
 * Simula las operaciones CRUD utilizando datos de archivos JSON locales.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Rutas de los archivos JSON para simulación de datos.
  private usersUrl = './assets/data/users.json';
  private estadosUrl = './assets/data/status-user.json';
  
  // Base de datos local simulada.
  private users: User[] = [];
  private estados: EstadoUsuario[] = [];

  // BehaviorSubject para notificar cambios en la lista de usuarios.
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  // Contador para generar IDs únicos en operaciones simuladas de 'crear'.
  private nextId = 1;

  /** * Carga inicial de usuarios y estados al arrancar el servicio.
   */
  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  /**
   * Obtiene todos los usuarios activos actualmente en el sistema.
   * @returns Un Observable con la lista de `User[]`.
   */
  getUsers(): Observable<User[]> {
    return this.users$;
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id El ID del usuario.
   * @returns El objeto `User` o `undefined`.
   */
  getUserById(id: number): Observable<User | undefined> {
    // Retorna el valor actual del BehaviorSubject para búsqueda síncrona simulada.
    const userFound = this.usersSubject.value.find(user => user.id === id);
    return of(userFound);
  }

  /**
   * Carga la lista de usuarios y estados desde los archivos JSON simultáneamente.
   */
  private loadInitialData(): void {
    // Define el tipo de dato que se espera del forkJoin.
    type InitialData = { usersData: User[], estadosData: EstadoUsuario[] };

    forkJoin({
      usersData: this.http.get<User[]>(this.usersUrl),
      estadosData: this.http.get<EstadoUsuario[]>(this.estadosUrl)
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar datos iniciales. Revisa los archivos JSON.', error);
        this.users = []; 
        this.estados = [];
        this.usersSubject.next([]);
        
        // Devolvemos un objeto vacío tipado para no romper el stream.
        const emptyData: InitialData = { usersData: [], estadosData: [] };
        return of(emptyData); 
      }),
      tap(({ usersData, estadosData }) => {
        // 1. Guardar y procesar ESTADOS
        this.estados = estadosData;
        console.log(`[UserService] 📑 ${this.estados.length} estados de usuario cargados.`);
        
        // 2. Guardar y procesar USUARIOS
        this.users = usersData;
        
        // Ajustar el contador `nextId` basado en el ID máximo existente.
        const maxId = usersData.reduce((max, user) => (user.id && user.id > max ? user.id : max), 0);
        this.nextId = maxId + 1; 
        
        // Emitir la lista inicial de usuarios.
        this.usersSubject.next([...this.users]); 
        console.log(`[UserService] 💾 ${this.users.length} usuarios cargados.`);
      })
    ).subscribe(); 
  }
}