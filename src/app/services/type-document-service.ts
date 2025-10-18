/**
 * @fileoverview Servicio para la gestión de los tipos de documento.
 * @description Se centraliza la obtención de las categorías o tipos de documentos
 * disponibles en la aplicación, incluyendo sus metadatos como el ícono a utilizar.
 */

import { Injectable } from '@angular/core';

/**
 * @interface TipoDocumento
 * Se define la estructura de datos para una categoría o tipo de documento.
 */
export interface TipoDocumento {
  idTipoDocumento: number;
  nombre: string;
  descripcion: string;
  icono: string; // Se almacena el nombre del ícono de Material a mostrar.
}

/**
 * @Injectable
 * Se declara la clase como un servicio disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {

  /**
   * Se define un arreglo privado con los tipos de documento disponibles.
   * Esto simula una fuente de datos fija mientras no se implemente una API.
   */
  private tipos: TipoDocumento[] = [
    { idTipoDocumento: 1, nombre: 'Acuerdos', descripcion: 'acuerdos', icono: 'gavel' },
    { idTipoDocumento: 2, nombre: 'Resoluciones', descripcion: 'resoluciones', icono: 'assignment' },
    { idTipoDocumento: 3, nombre: 'Disposiciones', descripcion: 'disposiciones', icono: 'receipt_long' },
    { idTipoDocumento: 4, nombre: 'Circulares', descripcion: 'circulares', icono: 'campaign' },
    { idTipoDocumento: 5, nombre: 'Ordenanzas', descripcion: 'ordenanzas', icono: 'article' },
  ];

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor() { }

  /**
   * @method getTiposDocumento
   * Se obtiene la lista completa de tipos de documento.
   * @returns Un arreglo de objetos de tipo `TipoDocumento`.
   */
  getTiposDocumento(): TipoDocumento[] {
    // TODO: Reemplazar esta lógica con una llamada a una API RESTful.
    return this.tipos;
  }
}
