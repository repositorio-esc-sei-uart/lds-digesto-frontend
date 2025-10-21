/**
 * @interface Rol
 * Define los roles de usuario dentro del sistema (ej. Administrador, Editor).
 */
export interface Rol {
  idRol: number;
  nombre: string;       // Ejemplo: "Administrador", "Editor"
  descripcion?: string; // Opcional
}
