import { Archivo } from "./archive-model";

/**
 * @interface DocumentoListItem
 * Se define la estructura para los elementos de la lista de documentos.
 * Contiene solo los datos necesarios para mostrar en las tarjetas.
 */
export interface DocumentoListItem {
  idDocumento: number;
  titulo: string;
  numDocumento: string;
  fechaCreacion: Date;
  resumen: string;
  tipoDocumento: string;
}

/**
 * @interface Documento
 * Se define la estructura de datos que representa a un documento en la aplicación.
 */
export interface Documento {
  idDocumento: number;
  titulo: string;
  resumen: string;
  numDocumento: string;
  fechaCreacion: Date;
  tipoDocumento: string;
  sector: string;
  estado: string;
  archivos: Archivo[];
  palabrasClave: string[];
  referencias: number[];
}
