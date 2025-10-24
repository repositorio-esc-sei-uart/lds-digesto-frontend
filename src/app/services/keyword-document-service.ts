import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PalabraClave } from '../interfaces/keyword-document-model';

@Injectable({
  providedIn: 'root'
})
export class KeywordDocumentService {
  // URL del archivo JSON con datos de palabras clave
  private dataUrl = './assets/data/keywords-document.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de palabras clave.
   * @returns Un Observable que emite un arreglo de objetos PalabraClave.
   */
  getKeywords(): Observable<PalabraClave[]> {
    return this.http.get<PalabraClave[]>(this.dataUrl);
  }
}
