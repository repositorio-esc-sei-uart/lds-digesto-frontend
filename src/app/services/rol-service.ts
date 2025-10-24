import { Injectable } from '@angular/core';
import { Rol } from '../interfaces/role-user-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {
    // URL del archivo JSON con datos de sectores
  private dataUrl = './assets/data/roles.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de sectores.
   * @returns Un Observable que emite un arreglo de objetos Sector.
   */
  getRol(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.dataUrl);
  }
}
