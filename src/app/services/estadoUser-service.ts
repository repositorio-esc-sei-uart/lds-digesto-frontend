import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoUsuario } from '../interfaces/status-user-model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EstadoUserService {
  // URL del archivo JSON con datos de sectores
  // private dataUrl = './assets/data/estadosUser.json'; // antes

  // Construye la URL base del endpoint usando la variable del environment
  private dataUrl = `${environment.apiUrl}/api/v1/estadosU`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getEstadosUser(): Observable<EstadoUsuario[]> {
    return this.http.get<EstadoUsuario[]>(this.dataUrl);
  }
}
