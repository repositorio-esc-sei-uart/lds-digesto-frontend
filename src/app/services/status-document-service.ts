import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoDocumento } from '../interfaces/status-document-model';

@Injectable({
  providedIn: 'root'
})
export class StatusDocumentService {
  // URL del archivo JSON con datos de estados de documento
  private dataUrl = './assets/data/statuses-document.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de estados de documento.
   * @returns Un Observable que emite un arreglo de objetos EstadoDocumento.
   */
  getEstados(): Observable<EstadoDocumento[]> {
    return this.http.get<EstadoDocumento[]>(this.dataUrl);
  }
}
