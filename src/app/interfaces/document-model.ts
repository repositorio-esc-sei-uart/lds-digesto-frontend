import { Archivo } from "./archive-document-model";
import { PalabraClave } from "./keyword-document-model";
import { Sector } from "./sector-model";
import { EstadoDocumento } from "./status-document-model";
import { TipoDocumento } from "./type-document-model";
import { UnidadEjecutora } from "./unidad-ejecutora-model";

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
  tipoDocumento: TipoDocumento;
  estado: EstadoDocumento;
}

/**
 * @interface ReferenciaDocumento
 * Define la estructura resumida para mostrar en las listas de referencias.
 * Es la versión "desnormalizada" que envía el backend para optimizar.
 */
export interface ReferenciaDocumento {
  idDocumento: number;
  numDocumento: string;
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
  tipoDocumento: TipoDocumento;
  sector: Sector;
  unidadEjecutora: UnidadEjecutora;
  estado: EstadoDocumento;
  activo: boolean;
  archivos: Archivo[];
  palabrasClave: PalabraClave[];
  referencias: ReferenciaDocumento[];
  referenciadoPor: ReferenciaDocumento[];
}
