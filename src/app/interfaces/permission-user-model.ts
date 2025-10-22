/**
 * @interface Permiso
 * Define un permiso específico dentro del sistema, que puede ser asignado a roles.
 */
export interface Permiso {
  idPermiso: number;
  nombre: string;       // Ejemplo: "crear_documento", "editar_usuario"
  descripcion?: string; // Opcional: Descripción detallada del permiso
}
