/**
 * Interfaz para los filtros de búsqueda avanzada
 */
export interface AdvancedFilter {
  titulo?: string;
  numDocumento?: string;
  idTipoDocumento?: number;
  idSector?: number;
  idEstado?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  excluirPalabras?: string;
}
