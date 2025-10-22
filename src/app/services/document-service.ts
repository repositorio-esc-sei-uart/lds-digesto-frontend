/**
 * @fileoverview Servicio para la gestión de datos de documentos.
 * @description Se centraliza la lógica para obtener y gestionar los documentos de la aplicación.
 * Actualmente, utiliza datos locales (mock), pero está preparado para conectarse a una API en el futuro.
 */

import { Injectable } from '@angular/core';
import { Documento, DocumentoListItem } from '../interfaces/document-model';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

/**
 * @Injectable
 * Se declara la clase como un servicio que puede ser inyectado en otros componentes o servicios.
 * `providedIn: 'root'` lo hace disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // URL del archivo JSON con datos de documentos
  private dataUrl = './assets/data/documents.json';

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * @method getDocumentos
   * Se obtiene la lista de documentos con datos mínimos para las tarjetas.
   * Simula el endpoint de lista de una API real.
   * @returns Un arreglo de objetos de tipo `DocumentoListItem`.
   */
  getDocumentos(): Observable<DocumentoListItem[]> {
    // Aquí harías el http.get
    // Por ahora simulamos la lista, pero la lógica de carga iría aquí
    return this.http.get<Documento[]>(this.dataUrl).pipe(
      // Convierte todos los strings de fecha a objetos Date
      map(docs => this.mapDocumentDates(docs)),

      // Transforma el array de Documento[] en DocumentoListItem[]
      map(documentos =>
        documentos.map(doc => ({
          idDocumento: doc.idDocumento,
          titulo: doc.titulo,
          numDocumento: doc.numDocumento,
          fechaCreacion: doc.fechaCreacion, // Esta ya es un objeto Date
          resumen: doc.resumen,
          tipoDocumento: doc.tipoDocumento
        }))
      )
    );
  }

  /**
   * @method getDocumentoById
   * Se busca y devuelve un documento específico por su ID.
   * @param id El identificador numérico del documento a buscar.
   * @returns El objeto `Documento` si se encuentra, o `undefined` si no existe.
   */
  getDocumentoById(id: number): Observable<Documento | undefined> {
    // La lógica real implicaría cargar el JSON y luego usar .pipe(map(...))
    // para encontrar el documento por ID
    return this.http.get<Documento[]>(this.dataUrl).pipe(
      // Convierte todos los strings de fecha a objetos Date
      map(docs => this.mapDocumentDates(docs)),

      // Encuentra el documento por su ID
      map(documentos => documentos.find(doc => doc.idDocumento === id))
    );
  }

  /**
   * Función helper para convertir las fechas de string a Date
   * ya que JSON no soporta objetos Date.
   */
  private mapDocumentDates(documentos: Documento[]): Documento[] {
    return documentos.map(doc => ({
      ...doc,
      // Convierte el string "YYYY-MM-DD" a un objeto Date
      fechaCreacion: new Date(doc.fechaCreacion)
    }));
  }
}
