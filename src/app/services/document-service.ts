/**
 * @fileoverview Servicio para la gestión de datos de documentos.
 * @description Se centraliza la lógica para interactuar con los documentos.
 * Carga datos de simulación (JSON) para la lectura y se conecta a la API real
 * para la creación (POST) de nuevos documentos.
 */

import { Injectable } from '@angular/core';
import { Documento, DocumentoListItem,ReferenciaDocumento } from '../interfaces/document-model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, delay, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { TipoDocumento, } from '../interfaces/type-document-model';
import { EstadoDocumento } from '../interfaces/status-document-model';
import { Sector } from '../interfaces/sector-model';
import { Archivo } from '../interfaces/archive-document-model';
import { PalabraClave } from '../interfaces/keyword-document-model';

// --- Definiciones de DTOs del Backend (Lo que la API envía) ---
// (Define cómo se verá el EstadoDTO que viene del backend)
interface BackendEstadoDTO {
  idEstado: number;
  nombre: string;
  descripcion?: string;
}
// DTO anidado que el backend envía
interface BackendTipoDocumentoDTO {
  idTipoDocumento: number;
  nombre: string;
  descripcion: string;
}

// DTO para la TABLA (GET /api/v1/documentos) 
interface BackendDocumentoTablaDTO {
  idDocumento: number;
  titulo: string;
  numDocumento: string;
  fechaCreacion: string; // El backend la envía como string
  resumen: string;
  tipoDocumento: BackendTipoDocumentoDTO; // <-- DTO anidado
  estado: BackendEstadoDTO;
}

// DTO para el DETALLE (GET /api/v1/documentos/{id})
interface BackendDocumentoDTO {
  idDocumento: number;
  titulo: string;
  resumen: string;
  numDocumento: string;
  fechaCreacion: string;
  // Nombres "planos"
  nombreEstado: string;
  nombreTipoDocumento: string;
  nombreSector: string;
  // Listas de DTOs
  archivos: Archivo[];
  palabrasClave: PalabraClave[];
  referencias: ReferenciaDocumento[];
  referenciadoPor?: ReferenciaDocumento[];
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
  // URL base de la API de documentos (obtenida del environment)
  private apiUrl = `${environment.apiUrl}/api/v1/documentos`; 
  /**
   * @constructor
   * Inyecta el HttpClient de Angular para realizar peticiones.
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * @method getDocumentos
   * Obtiene la lista de documentos (DTO de tabla) del backend,
   * la "rehidrata" al formato que el frontend espera (DocumentoListItem),
   * y la devuelve como un Observable.
   */
  getDocumentos(): Observable<DocumentoListItem[]> {
    // --- USA EL API REAL ---
    return this.http.get<BackendDocumentoTablaDTO[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.rehidratarTablaDTO(dto))),
      catchError(this.handleError<DocumentoListItem[]>('getDocumentos'))
    );
  }

  /**
   * @method getDocumentoById
   * Obtiene un documento específico (DTO de detalle) por su ID desde el backend
   * y lo "rehidrata" al formato completo de la interfaz `Documento`.
   * @param id El identificador numérico del documento a buscar.
   * @returns El objeto `Documento` si se encuentra, o `undefined` si no existe.
   */
  getDocumentoById(id: number): Observable<Documento | undefined> {
    const url = `${this.apiUrl}/${id}`;
    // --- USA EL API REAL ---
    return this.http.get<BackendDocumentoDTO>(url).pipe(
      map(dto => this.rehidratarDocumentoDTO(dto)),
      catchError(this.handleError<Documento | undefined>(`getDocumentoById id=${id}`))
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
   * Sube uno o más archivos físicos al backend y los asocia a un documento.
   * Llama al endpoint: POST /api/v1/archivos/subir/{idDocumento}
   * @param idDocumento El ID del documento al que se adjuntarán.
   * @param archivos La lista de objetos File a subir.
   */
  subirArchivos(idDocumento: number, archivos: File[]): Observable<any> {
    
    // 1. Construimos la URL del endpoint de subida de archivos 
    const uploadUrl = `${environment.apiUrl}/api/v1/archivos/subir/${idDocumento}`;

    // 2. Usamos FormData para enviar archivos (multipart/form-data)
    const formData = new FormData();

    // 3. Adjuntamos cada archivo. La clave "file" debe coincidir
    // con el @RequestParam("file") del backend 
    archivos.forEach(archivo => {
      // El backend recibirá el nombre original del archivo
      formData.append('file', archivo, archivo.name);
    });

    console.log(`[DocumentService-REAL] POST a ${uploadUrl} (Subiendo ${archivos.length} archivos)`);

    // 4. Hacemos el POST con FormData.
    return this.http.post<any>(uploadUrl, formData).pipe(
      tap(response => console.log('Respuesta de subida de archivos:', response)),
      catchError(this.handleError<any>('subirArchivos'))
    );
  }
  /**
   * Elimina un documento por su ID.
   * Llama al endpoint: DELETE /api/v1/documentos/{id}
   */
  deleteDocumento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`[DocumentService-REAL] DELETE a ${url}`);
    
    return this.http.delete<void>(url).pipe(
      tap(() => console.log(`Documento ${id} eliminado con éxito.`)),
      catchError(this.handleError<void>('deleteDocumento'))
    );
  }
  /**
   * @private
   * Helper para "rehidratar" el DTO de Tabla a la interfaz del Frontend.
   */
  private rehidratarTablaDTO(dto: BackendDocumentoTablaDTO): DocumentoListItem {
    return {
      idDocumento: dto.idDocumento,
      titulo: dto.titulo,
      numDocumento: dto.numDocumento,
      fechaCreacion: new Date(dto.fechaCreacion + 'T00:00:00'), // Corrige la zona horaria
      resumen: dto.resumen,
      // Mapeamos el DTO anidado a la interfaz anidada 'TipoDocumento'
      tipoDocumento: { 
        idTipoDocumento: dto.tipoDocumento.idTipoDocumento,
        nombre: dto.tipoDocumento.nombre,
        descripcion: dto.tipoDocumento.descripcion
      },
      // Creamos un objeto 'estado' vacío porque el backend no lo envía en esta vista
      estado: { 
        idEstado: dto.estado.idEstado, 
        nombre: dto.estado.nombre,
        descripcion: dto.estado.descripcion
      } as EstadoDocumento 
   
    };
  }

  /**
   * @private
   * Helper para "rehidratar" el DTO de Detalle a la interfaz del Frontend.
   */
  private rehidratarDocumentoDTO(dto: BackendDocumentoDTO): Documento {
    return {
      idDocumento: dto.idDocumento,
      titulo: dto.titulo,
      numDocumento: dto.numDocumento,
      resumen: dto.resumen,
      fechaCreacion: new Date(dto.fechaCreacion + 'T00:00:00'),
      
      // "Inflamos" los strings planos a los objetos que el frontend espera
      tipoDocumento: { 
        idTipoDocumento: 0,
        nombre: dto.nombreTipoDocumento,
        descripcion: ''
      },
      sector: { 
        idSector: 0, 
        nombre: dto.nombreSector 
      } as Sector,
      estado: { 
        idEstado: 0, 
        nombre: dto.nombreEstado 
      } as EstadoDocumento,
      
      archivos: dto.archivos || [],
      palabrasClave: dto.palabrasClave || [],
      referencias: dto.referencias || [],
      referenciadoPor: dto.referenciadoPor || []
    };
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
  /**
   * (MÉTODO FUTURO) Sube archivos al backend.
   * El backend usará el Título del documento como nombre base.
   */
  /*
  subirArchivosConTitulo(idDocumento: number, archivos: File[], titulo: string): Observable<any> {
    const uploadUrl = `${environment.apiUrl}/api/v1/archivos/subirPorTitulo/${idDocumento}`;
    const formData = new FormData();
    archivos.forEach(archivo => formData.append('file', archivo, archivo.name));
    
    // El backend leerá el título para sanitizarlo y usarlo como nombre
    formData.append('nombreBase', titulo); 

    return this.http.post<any>(uploadUrl, formData).pipe(
      tap(response => console.log('Respuesta de subida (Titulo):', response)),
      catchError(this.handleError<any>('subirArchivosConTitulo'))
    );
  }
  */

  /**
   * (MÉTODO FUTURO) Sube archivos al backend.
   * El backend usará el N° de Documento como nombre base.
   */
  /*
  subirArchivosConNumDoc(idDocumento: number, archivos: File[], numDocumento: string): Observable<any> {
    const uploadUrl = `${environment.apiUrl}/api/v1/archivos/subirPorNumDoc/${idDocumento}`;
    const formData = new FormData();
    archivos.forEach(archivo => formData.append('file', archivo, archivo.name));
    
    // El backend leerá el numDocumento para sanitizarlo y usarlo como nombre
    formData.append('nombreBase', numDocumento); 

    return this.http.post<any>(uploadUrl, formData).pipe(
      tap(response => console.log('Respuesta de subida (NumDoc):', response)),
      catchError(this.handleError<any>('subirArchivosConNumDoc'))
    );
  }
  */
}