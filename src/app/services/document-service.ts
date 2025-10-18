/**
 * @fileoverview Servicio para la gestión de datos de documentos.
 * @description Se centraliza la lógica para obtener y gestionar los documentos de la aplicación.
 * Actualmente, utiliza datos locales (mock), pero está preparado para conectarse a una API en el futuro.
 */

import { Injectable } from '@angular/core';

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
}

/**
 * @Injectable
 * Se declara la clase como un servicio que puede ser inyectado en otros componentes o servicios.
 * `providedIn: 'root'` lo hace disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  /** * Se define un arreglo privado con datos de ejemplo (mock data).
   * Esto simula una fuente de datos mientras no se implementa la conexión a una API real.
   */
  private documentos: Documento[] = [
    { idDocumento: 1, titulo: 'Aprobación Presupuesto Anual 2024', resumen: 'Se aprueban las partidas presupuestarias para el ejercicio fiscal del año 2024.Se aprueban las partidas presupuestarias para el ejercicio fiscal del año 2024.', numDocumento: 'RES-2024-101-UART', fechaCreacion: new Date('2024-10-15'), tipoDocumento: 'Resoluciones', sector: 'Rectorado' },
    { idDocumento: 2, titulo: 'Designación de Nuevo Personal', resumen: 'Nombramiento de personal administrativo para el área de secretaría académica.', numDocumento: 'DIS-2024-052-UART', fechaCreacion: new Date('2024-10-12'), tipoDocumento: 'Disposiciones', sector: 'Secretaría Académica' },
    { idDocumento: 3, titulo: 'Llamado a Licitación Pública N°5', resumen: 'Convocatoria para la licitación del servicio de mantenimiento de infraestructura edilicia.', numDocumento: 'RES-2024-102-UART', fechaCreacion: new Date('2024-10-11'), tipoDocumento: 'Resoluciones', sector: 'Administración' },
    { idDocumento: 4, titulo: 'Calendario Académico 2025', resumen: 'Establecimiento de las fechas de inicio, finalización de cuatrimestres y mesas de examen.', numDocumento: 'ORD-2024-003-CS', fechaCreacion: new Date('2024-09-30'), tipoDocumento: 'Ordenanzas', sector: 'Consejo Superior' },
    { idDocumento: 5, titulo: 'Protocolo de Bioseguridad', resumen: 'Actualización de las medidas y protocolos de seguridad e higiene para los laboratorios.', numDocumento: 'CIR-2024-015-UART', fechaCreacion: new Date('2024-09-25'), tipoDocumento: 'Circulares', sector: 'Higiene y Seguridad' },
    { idDocumento: 6, titulo: 'Modificación Plan de Estudios Modificación Plan de Estudios Modificación Plan de Estudios', resumen: 'Ajustes en la currícula de la carrera de Analista de Sistemas.', numDocumento: 'ORD-2024-004-CS', fechaCreacion: new Date('2024-09-22'), tipoDocumento: 'Ordenanzas', sector: 'Consejo Superior' }
  ];

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor() {}

  /**
   * @method getDocumentos
   * Se obtiene la lista completa de documentos.
   * @returns Un arreglo de objetos de tipo `Documento`.
   */
  getDocumentos(): Documento[] {
    // TODO: Reemplazar esta lógica con una llamada a una API RESTful.
    // Por ahora, solo se devuelve el arreglo local.
    return this.documentos;
  }

  /**
   * @method getDocumentoById
   * Se busca y devuelve un documento específico por su ID.
   * @param id El identificador numérico del documento a buscar.
   * @returns El objeto `Documento` si se encuentra, o `undefined` si no existe.
   */
  getDocumentoById(id: number): Documento | undefined {
    return this.documentos.find(doc => doc.idDocumento === id);
  }
}
