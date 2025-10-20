/**
 * @fileoverview Define los modelos de datos y las interfaces relacionadas con los usuarios y la autenticación.
 * Al centralizar estas definiciones, se promueve la reutilización y un único punto de verdad
 * para la estructura de los datos en toda la aplicación.
 */

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
  rol: 'Administrador' | 'Editor';
  estado: 'Activo' | 'Suspendido';
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
