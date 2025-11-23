/**
 * @interface TipoDocumento
 * Se define la estructura de datos para una categoría o tipo de documento.
 */
export interface TipoDocumento {
  idTipoDocumento: number;
  nombre: string;
  descripcion: string;
  nomenclatura?: string;
  // icono: string; // Se almacena el nombre del ícono de Material a mostrar (futura personalización).
}
