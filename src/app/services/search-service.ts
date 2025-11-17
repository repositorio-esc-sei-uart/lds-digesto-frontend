/**
 * @fileoverview Servicio para la gestión del estado de búsqueda.
 * @description Se centraliza el término de búsqueda para que múltiples componentes
 * puedan reaccionar a los cambios en tiempo real. Utiliza un BehaviorSubject de RxJS
 * para comunicar el estado de la barra de búsqueda.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

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

  // Observable para abrir búsqueda avanzada (modal legacy)
  private openAdvancedSearchSubject = new Subject<void>();
  public openAdvancedSearch$ = this.openAdvancedSearchSubject.asObservable();

  // Observable para filtros avanzados (dropdown)
  private filtrosAvanzadosSubject = new Subject<any>();
  public filtrosAvanzados$ = this.filtrosAvanzadosSubject.asObservable();

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

  /**
   * @method triggerAdvancedSearch
   * Es llamado por el HeaderComponent para notificar al HomeComponent
   * que debe abrir el modal de búsqueda avanzada.
   */
  triggerAdvancedSearch(): void {
    this.openAdvancedSearchSubject.next();
  }

  /**
   * Aplica filtros avanzados desde el dropdown
   */
  aplicarFiltrosAvanzados(filtros: any): void {
    this.filtrosAvanzadosSubject.next(filtros);
  }

  // Subject para limpiar la búsqueda
  private limpiarBusquedaSubject = new Subject<void>();
  limpiarBusqueda$ = this.limpiarBusquedaSubject.asObservable();

  /**
   * Notifica que se deben limpiar todos los filtros incluyendo la barra de búsqueda
   */
  limpiarTodo(): void {
    this.limpiarBusquedaSubject.next();
    this.actualizarBusqueda('');
  }
}
