/**
 * @interface EstadoUsuario
 * Define los posibles estados de una cuenta de usuario (ej. Activo, Suspendido).
 */
export interface EstadoUsuario {
  idEstadoU: number;
  nombre: string;       // Ejemplo: "Activo", "Suspendido"
  descripcion?: string; // Opcional
}
