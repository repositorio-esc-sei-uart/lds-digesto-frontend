/**
 * @interface Archivo
 * Se define la estructura de un archivo adjunto asociado a un documento.
 */
export interface Archivo {
  idArchivo: number;
  nombre: string;
  url: string; // URL para acceder/descargar el archivo PDF
}
