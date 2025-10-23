import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, forkJoin, Observable, of, tap } from 'rxjs';
import { User } from '../interfaces/user-model';
import { EstadoUsuario } from '../interfaces/status-user-model';
import { Rol } from '../interfaces/role-user-model';
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
  private estadosUrl = './assets/data/estadosUser.json';
  private rolUrl= './assets/data/roles.json';
  
  // Base de datos local simulada.
  private users: User[] = [];
  private estados: EstadoUsuario[] = [];
  private rol: Rol[]=[];

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
    type InitialData = { usersData: User[], estadosData: EstadoUsuario[], rolesData : Rol[]}; // 👈 AJUSTE: Tipado correcto

    forkJoin({
      usersData: this.http.get<User[]>(this.usersUrl),
     estadosData: this.http.get<EstadoUsuario[]>(this.estadosUrl),
      rolesData: this.http.get<Rol[]>(this.rolUrl)

    }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error al cargar datos iniciales. Revisa los archivos JSON.', error);
        this.users = []; 
        this.estados = [];
       this.rol = []; // 👈 AJUSTE: Inicializar la lista de roles en caso de error
        this.usersSubject.next([]);
 
       // Devolvemos un objeto vacío tipado para no romper el stream.
       const emptyData: InitialData = { usersData: [], estadosData: [] , rolesData: []}; // 👈 CORRECCIÓN DE SINTAXIS: rolesData: []
        return of(emptyData); 
     }),
    tap(({ usersData, estadosData ,rolesData}) => {
       // 1. Guardar y procesar ESTADOS
        this.estados = estadosData;
        console.log(`[UserService] 📑 ${this.estados.length} estados de usuario cargados.`);
        
        // 2. Guardar y procesar ROLES 👈 NUEVO: Guardar roles
        this.rol = rolesData;
        console.log(`[UserService] 🎭 ${this.rol.length} roles de usuario cargados.`);

        // 3. Guardar y procesar USUARIOS
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
    /**
   * @method createUser
   * Simulación de creación de un nuevo usuario (POST).
   * Opera sobre el arreglo `users` en memoria, ya que no se puede escribir en el archivo JSON.
   * @param newUser El objeto `User` (sin ID o con ID temporal) a guardar.
   * @returns Un Observable que emite el objeto `User` creado, ahora con su ID asignado.
   */
  createUser(newUser: User | null | undefined): Observable<User> {
    if (!newUser) {
      console.error('❌ No se recibió un usuario válido para crear.');
      // devolvemos un Observable vacío pero con un valor compatible con el tipo esperado
      return of({} as User);
    }

    // Asigna un nuevo ID único y agrega el usuario al array local
     const userToAdd: User = {
      ...newUser,
      id: this.nextId++
    };

    this.users.push(userToAdd);

    // Notifica a todos los suscriptores que la lista cambió
    this.usersSubject.next([...this.users]);

    console.log(`[UserService] ✅ Usuario creado con ID ${userToAdd.id}`);

    // Retorna el usuario recién creado como Observable
    return of(userToAdd);
  }
}