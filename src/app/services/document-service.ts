/**
 * @fileoverview Servicio para la gestión de datos de documentos.
 * @description Se centraliza la lógica para obtener y gestionar los documentos de la aplicación.
 * Actualmente, utiliza datos locales (mock), pero está preparado para conectarse a una API en el futuro.
 */

import { Injectable } from '@angular/core';

/**
 * @interface Archivo
 * Se define la estructura de un archivo adjunto asociado a un documento.
 */
export interface Archivo {
  idArchivo: number;
  nombre: string;
  url: string; // URL para acceder/descargar el archivo PDF, DOCX, etc.
}

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
    // --- Set de Datos Original Mejorado ---
    {
      idDocumento: 1,
      titulo: 'Aprobación Presupuesto Anual 2024',
      resumen: 'Se aprueban las partidas presupuestarias para el ejercicio fiscal del año 2024.',
      numDocumento: 'RES-2024-101-UART',
      fechaCreacion: new Date('2024-10-15'),
      tipoDocumento: 'Resoluciones',
      sector: 'Rectorado',
      estado: 'vigente',
      archivos: [{ idArchivo: 1, nombre: 'RES-2024-101-UART.pdf', url: '/archivos/RES-2024-101-UART.pdf' }],
      palabrasClave: ['presupuesto', 'anual', 'partidas', 'rectorado'],
      referencias: []
    },
    {
      idDocumento: 2,
      titulo: 'Designación de Nuevo Personal',
      resumen: 'Nombramiento de personal administrativo para el área de secretaría académica.',
      numDocumento: 'DIS-2024-052-UART',
      fechaCreacion: new Date('2024-10-12'),
      tipoDocumento: 'Disposiciones',
      sector: 'Secretaría Académica',
      estado: 'vigente',
      archivos: [
        { idArchivo: 2, nombre: 'DIS-2024-052-UART.pdf', url: '/archivos/DIS-2024-052-UART.pdf' },
        { idArchivo: 3, nombre: 'DIS-2024-052-UART - anexo A.pdf', url: '/archivos/DIS-2024-052-UART-anexo-A.pdf'}
      ],
      palabrasClave: ['designacion', 'personal', 'nombramiento', 'academica'],
      referencias: []
    },
    {
      idDocumento: 3,
      titulo: 'Llamado a Licitación Pública N°5',
      resumen: 'Convocatoria para la licitación del servicio de mantenimiento de infraestructura edilicia.',
      numDocumento: 'RES-2024-102-UART',
      fechaCreacion: new Date('2024-10-11'),
      tipoDocumento: 'Resoluciones',
      sector: 'Administración',
      estado: 'vigente',
      archivos: [{ idArchivo: 4, nombre: 'RES-2024-102-UART.pdf', url: '/archivos/RES-2024-102-UART.pdf' }],
      palabrasClave: ['licitacion', 'publica', 'mantenimiento', 'infraestructura'],
      referencias: []
    },
    {
      idDocumento: 4,
      titulo: 'Calendario Académico 2025',
      resumen: 'Establecimiento de las fechas de inicio, finalización de cuatrimestres y mesas de examen.',
      numDocumento: 'ORD-2024-003-CS',
      fechaCreacion: new Date('2024-09-30'),
      tipoDocumento: 'Ordenanzas',
      sector: 'Consejo Superior',
      estado: 'derogado parcial',
      archivos: [{ idArchivo: 5, nombre: 'ORD-2024-003-CS.pdf', url: '/archivos/ORD-2024-003-CS.pdf' }],
      palabrasClave: ['calendario', 'academico', 'fechas', 'examen'],
      referencias: []
    },
    {
      idDocumento: 5,
      titulo: 'Protocolo de Bioseguridad',
      resumen: 'Actualización de las medidas y protocolos de seguridad e higiene para los laboratorios.',
      numDocumento: 'CIR-2024-015-UART',
      fechaCreacion: new Date('2024-09-25'),
      tipoDocumento: 'Circulares',
      sector: 'Higiene y Seguridad',
      estado: 'derogado total',
      archivos: [{ idArchivo: 6, nombre: 'CIR-2024-015-UART.pdf', url: '/archivos/CIR-2024-015-UART.pdf' }],
      palabrasClave: ['protocolo', 'bioseguridad', 'higiene', 'laboratorios'],
      referencias: []
    },
    {
      idDocumento: 6,
      titulo: 'Modificación Plan de Estudios',
      resumen: 'Ajustes en la currícula de la carrera de Analista de Sistemas.',
      numDocumento: 'ORD-2024-004-CS',
      fechaCreacion: new Date('2024-09-22'),
      tipoDocumento: 'Ordenanzas',
      sector: 'Consejo Superior',
      estado: 'vigente',
      archivos: [{ idArchivo: 7, nombre: 'ORD-2024-004-CS.pdf', url: '/archivos/ORD-2024-004-CS.pdf' }],
      palabrasClave: ['modificacion', 'plan', 'estudios', 'analista', 'sistemas'],
      referencias: []
    },
    // --- Set de 4 Registros Nuevos ---
    {
      idDocumento: 7,
      titulo: 'Rectificación de Fechas Calendario 2025',
      resumen: 'Se rectifican las fechas de mesas de examen del segundo cuatrimestre del Calendario Académico 2025.',
      numDocumento: 'RES-2025-001-CS',
      fechaCreacion: new Date('2025-03-10'),
      tipoDocumento: 'Resoluciones',
      sector: 'Consejo Superior',
      estado: 'vigente',
      archivos: [{ idArchivo: 8, nombre: 'RES-2025-001-CS.pdf', url: '/archivos/RES-2025-001-CS.pdf' }],
      palabrasClave: ['rectificacion', 'fechas', 'calendario', 'examen'],
      referencias: [4] // Hace referencia al Calendario Académico original
    },
    {
      idDocumento: 8,
      titulo: 'Creación Comisión de Seguimiento Presupuestario',
      resumen: 'Se crea una comisión ad-hoc para el seguimiento de la ejecución de las partidas del Presupuesto Anual 2024.',
      numDocumento: 'DIS-2024-080-UART',
      fechaCreacion: new Date('2024-11-05'),
      tipoDocumento: 'Disposiciones',
      sector: 'Rectorado',
      estado: 'vigente',
      archivos: [{ idArchivo: 9, nombre: 'DIS-2024-080-UART.pdf', url: '/archivos/DIS-2024-080-UART.pdf' }],
      palabrasClave: ['comision', 'seguimiento', 'presupuestario', 'ejecucion'],
      referencias: [1] // Hace referencia al Presupuesto Anual
    },
    {
      idDocumento: 9,
      titulo: 'Nuevo Protocolo de Bioseguridad 2025',
      resumen: 'Se establece el nuevo protocolo de bioseguridad para el ciclo lectivo 2025, derogando normativas anteriores.',
      numDocumento: 'ORD-2025-001-CS',
      fechaCreacion: new Date('2025-02-20'),
      tipoDocumento: 'Ordenanzas',
      sector: 'Consejo Superior',
      estado: 'vigente',
      archivos: [{ idArchivo: 10, nombre: 'ORD-2025-001-CS.pdf', url: '/archivos/ORD-2025-001-CS.pdf' }],
      palabrasClave: ['nuevo', 'protocolo', 'bioseguridad', '2025'],
      referencias: [5] // Hace referencia al protocolo anterior que queda derogado
    },
    {
      idDocumento: 10,
      titulo: 'Aclaratoria sobre Licitación Pública N°5',
      resumen: 'Se emite circular aclaratoria sobre los pliegos y condiciones de la Licitación Pública N°5 para mantenimiento.',
      numDocumento: 'CIR-2024-020-UART',
      fechaCreacion: new Date('2024-10-25'),
      tipoDocumento: 'Circulares',
      sector: 'Administración',
      estado: 'vigente',
      archivos: [
        { idArchivo: 11, nombre: 'CIR-2024-020-UART.pdf', url: '/archivos/CIR-2024-020-UART.pdf' },
        { idArchivo: 12, nombre: 'CIR-2024-020-UART - anexo B.pdf', url: '/archivos/CIR-2024-020-UART-anexo-B.pdf' }
      ],
      palabrasClave: ['aclaratoria', 'licitacion', 'pliegos', 'condiciones'],
      referencias: [1, 3] // Hace referencia al presupuesto y a la licitación
    }
  ];

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor() {}

  /**
   * @method getDocumentos
   * Se obtiene la lista de documentos con datos mínimos para las tarjetas.
   * Simula el endpoint de lista de una API real.
   * @returns Un arreglo de objetos de tipo `DocumentoListItem`.
   */
  getDocumentos(): DocumentoListItem[] {
    // Se utiliza .map() para transformar los datos completos en datos para la lista.
    return this.documentos.map(doc => ({
      idDocumento: doc.idDocumento,
      titulo: doc.titulo,
      numDocumento: doc.numDocumento,
      fechaCreacion: doc.fechaCreacion,
      resumen: doc.resumen,
      tipoDocumento: doc.tipoDocumento
    }));
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
