/**
 * @interface PalabraClave
 * Define una palabra clave o etiqueta descriptiva para un documento.
 */
export interface PalabraClave {
  idPalabraClave: number;
  nombre: string;       // Ejemplo: "presupuesto", "calendario"
  descripcion?: string; // Opcional
}
