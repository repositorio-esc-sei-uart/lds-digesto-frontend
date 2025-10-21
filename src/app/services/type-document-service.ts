/**
 * @fileoverview Servicio para la gestión de los tipos de documento.
 * @description Se centraliza la obtención de las categorías o tipos de documentos
 * disponibles en la aplicación, incluyendo sus metadatos como el ícono a utilizar.
 */

import { Injectable } from '@angular/core';
import { TipoDocumento } from '../interfaces/type-document-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @Injectable
 * Se declara la clase como un servicio disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {

  // URL del nuevo archivo JSON
  private dataUrl = './assets/data/types-document.json';

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor(
    private http: HttpClient
  ) { }

  /**
   * @method getTiposDocumento
   * Se obtiene la lista completa de tipos de documento.
   * @returns Un arreglo de objetos de tipo `TipoDocumento`.
   */
  getTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(this.dataUrl);
  }
}
