import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoUsuario } from '../interfaces/status-user-model';

@Injectable({
  providedIn: 'root'
})
export class EstadoUserService {
    // URL del archivo JSON con datos de sectores
  private dataUrl = './assets/data/estadosUser.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getEstadoUser(): Observable<EstadoUsuario[]> {
    return this.http.get<EstadoUsuario[]>(this.dataUrl);
  }
}
