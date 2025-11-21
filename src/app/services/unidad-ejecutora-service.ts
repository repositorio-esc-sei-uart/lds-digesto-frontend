import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development'; // O environment.ts según corresponda
import { UnidadEjecutora } from '../interfaces/unidad-ejecutora-model';

@Injectable({
  providedIn: 'root'
})
export class UnidadEjecutoraService {
  // Endpoint exacto según tu backend (UnidadEjecutoraController)
  private dataUrl = `${environment.apiUrl}/api/v1/unidadEjecutora`;

  constructor(private http: HttpClient) { }

  getUnidadesEjecutoras(): Observable<UnidadEjecutora[]> {
    return this.http.get<UnidadEjecutora[]>(this.dataUrl);
  }
}