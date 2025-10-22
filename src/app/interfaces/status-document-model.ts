/**
 * @interface EstadoDocumento
 * Define los posibles estados de un documento.
 */
export interface EstadoDocumento {
  idEstado: number;
  nombre: string;       // Ejemplo: "vigente", "derogado parcial"
  descripcion?: string; // Opcional
}
