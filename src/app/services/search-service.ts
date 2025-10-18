/**
 * @fileoverview Servicio para la gestión del estado de búsqueda.
 * @description Se centraliza el término de búsqueda para que múltiples componentes
 * puedan reaccionar a los cambios en tiempo real. Utiliza un BehaviorSubject de RxJS
 * para comunicar el estado de la barra de búsqueda.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @Injectable
 * Se declara la clase como un servicio disponible en toda la aplicación (singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  /**
   * Se define la fuente del término de búsqueda.
   * - Es un `BehaviorSubject` para que los nuevos suscriptores reciban inmediatamente el último valor.
   * - Es privado para que solo el servicio pueda emitir nuevos valores.
   * - Se inicializa con un string vacío.
   */
  private searchTermSource = new BehaviorSubject<string>('');

  /**
   * Se expone el `BehaviorSubject` como un `Observable` público.
   * Esto permite que los componentes se suscriban a los cambios, pero no puedan
   * emitir nuevos valores directamente, manteniendo el control dentro del servicio.
   */
  public searchTerm$ = this.searchTermSource.asObservable();

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor() { }

  /**
   * @method actualizarBusqueda
   * Se actualiza el valor del término de búsqueda.
   * Cualquier componente suscrito a `searchTerm$` recibirá este nuevo valor.
   * @param term El nuevo texto introducido por el usuario en la barra de búsqueda.
   */
  actualizarBusqueda(term: string): void {
    this.searchTermSource.next(term);
  }
}
