/**
 * @interface Sector
 * Define los sectores emisores de documentos.
 */
export interface Sector {
  idSector: number;
  nombre: string;       // Ejemplo: "Rectorado", "Consejo Superior"
  descripcion?: string; // Opcional
  nomenclatura?: string;
}
