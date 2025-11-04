/**
 * @fileoverview Servicio para la gestión de datos de documentos.
 * @description Se centraliza la lógica para interactuar con los documentos.
 * Carga datos de simulación (JSON) para la lectura y se conecta a la API real
 * para la creación (POST) de nuevos documentos.
 */

import { Injectable } from '@angular/core';
import { Documento, DocumentoListItem } from '../interfaces/document-model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, delay, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

/**
 * @Injectable
 * Se declara la clase como un servicio que puede ser inyectado en otros componentes o servicios.
 * `providedIn: 'root'` lo hace disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // URL del archivo JSON con datos de documentos (para simulación de lectura)
  private dataUrl = './assets/data/documents.json';

  /**
   * @constructor
   * Inyecta el HttpClient de Angular para realizar peticiones.
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * @method getDocumentos
   * Obtiene la lista de documentos desde el archivo JSON de simulación (mock).
   * @returns Un Observable que emite un arreglo de objetos de tipo `DocumentoListItem`.
   */
  getDocumentos(): Observable<DocumentoListItem[]> {
    // Carga los datos desde el archivo local 'documents.json'
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
          tipoDocumento: doc.tipoDocumento,
          estado: doc.estado
        }))
      )
    );
  }

  /**
   * @method getDocumentoById
   * Busca un documento específico por su ID en el archivo JSON de simulación.
   * @param id El identificador numérico del documento a buscar.
   * @returns El objeto `Documento` si se encuentra, o `undefined` si no existe.
   */
  getDocumentoById(id: number): Observable<Documento | undefined> {
    // Carga el JSON y filtra para encontrar el documento por su ID
    return this.http.get<Documento[]>(this.dataUrl).pipe(
      // Convierte todos los strings de fecha a objetos Date
      map(docs => this.mapDocumentDates(docs)),

      // Encuentra el documento por su ID
      map(documentos => documentos.find(doc => doc.idDocumento === id))
    );
  }

  /**
   * Envía el DTO del nuevo documento al backend para su creación.
   * @param documentoDTO El DTO con los IDs aplanados, listo para el backend.
   */
  createDocumento(documentoDTO: any): Observable<any> {
    
    // --- ESTA ES LA IMPLEMENTACIÓN REAL ---
    
    // Obtenemos la URL del environment
    const apiUrl = `${environment.apiUrl}/api/v1/documentos`; 

    console.log(`[DocumentService-REAL] POST a ${apiUrl}`, documentoDTO);
    
    // Usamos this.http.post para enviar el DTO al backend.
    return this.http.post<any>(apiUrl, documentoDTO).pipe(
      tap(response => console.log('Respuesta del backend:', response)),
      catchError(this.handleError<any>('createDocumento'))
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

 /**
  * @private
  * Captura y registra un error de HttpClient en la consola.
  * Lo más importante es que **relanza el error** para que el 
  * componente que se suscribió (ej. DocumentForm) lo reciba 
  * en su bloque 'error:' y pueda mostrarlo al usuario.
  */
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operation}:`, error);
      
      // Relanza el error original para que el suscriptor (el componente) lo reciba
      return throwError(() => error); 
    };
  }
}