import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sector } from '../interfaces/sector-model';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  // URL del archivo JSON con datos de sectores
  private dataUrl = './assets/data/sectors.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getSectores(): Observable<Sector[]> {
    return this.http.get<Sector[]>(this.dataUrl);
  }
}
