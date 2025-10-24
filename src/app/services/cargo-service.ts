import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cargo } from '../interfaces/job-title-user-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
    // URL del archivo JSON con datos de sectores
  private dataUrl = './assets/data/cargos.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getCargo(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.dataUrl);
  }
}
