/**
 * @interface Cargo
 * Define los cargos que puede ocupar un usuario en la institución.
 */
export interface Cargo {
  idCargo: number;
  nombre: string;       // Ejemplo: "Secretario", "Director"
  descripcion?: string; // Opcional
}
