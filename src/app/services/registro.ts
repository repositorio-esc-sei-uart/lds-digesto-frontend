import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta la ruta
import { Registro } from '../interfaces/registro';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  // Apunta al endpoint de auditoría
  private apiUrl = environment.apiUrl + '/api/v1/registros'; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los registros de auditoría desde el backend.
   */
  getRegistros(): Observable<Registro[]> {
    return this.http.get<Registro[]>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error al cargar el historial de registros', error);
        return of([]); 
      })
    );
  }
}