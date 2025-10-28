import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cargo } from '../interfaces/job-title-user-model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
@Injectable({
  providedIn: 'root'
})
export class CargoService {
    // URL del archivo JSON con datos de cargos
  // private dataUrl = './assets/data/cargos.json'; // antes

  // Construye la URL base del endpoint usando la variable del environment
  private dataUrl = `${environment.apiUrl}/api/v1/cargos`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getCargos(): Observable<Cargo[]> {
    return this.http.get<Cargo[]>(this.dataUrl);
  }
}
