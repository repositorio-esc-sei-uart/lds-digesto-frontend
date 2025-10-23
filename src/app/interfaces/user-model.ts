/**
 * @fileoverview Define los modelos de datos y las interfaces relacionadas con los usuarios y la autenticación.
 * Al centralizar estas definiciones, se promueve la reutilización y un único punto de verdad
 * para la estructura de los datos en toda la aplicación.
 */

import { Cargo } from "./job-title-user-model";
import { Rol } from "./role-user-model";
import { Sector } from "./sector-model";
import { EstadoUsuario } from "./status-user-model";

/**
 * Representa el perfil público de un usuario, con la información que se puede
 * mostrar de forma segura en la aplicación.
 */
export interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  legajo: string;
  rol: Rol;
  estado: EstadoUsuario;
}

/**
 * @interface User
 * Se define la estructura de datos que representa a un usuario en la aplicación.
 */
export interface User {
  id: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  password:string;
  legajo: string;
  rol: Rol;
  estado: EstadoUsuario;
  sector: Sector;
  cargo: Cargo;
}


/**
 * Define la estructura estándar de la respuesta del endpoint de autenticación.
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
}

/**
 * Tipo interno para la base de datos simulada que extiende el perfil de usuario
 * para incluir la contraseña. No debe ser usado fuera de los servicios de simulación.
 */
export type MockUser = UserProfile & { password?: string };
