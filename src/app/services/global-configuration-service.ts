/**
 * @fileoverview Servicio de Configuración Global.
 * @description Se centraliza la configuración de la aplicación para facilitar
 * el mantenimiento y la personalización de la apariencia y comportamiento.
 */

import { Injectable } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';

/**
 * @Injectable
 * Se declara la clase como un servicio disponible en toda la aplicación (singleton).
 * Permite que cualquier componente pueda acceder a estas configuraciones de forma centralizada.
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalConfigurationService {

  /** @section Configuración del Header */

  /** Se define la URL del logo que se mostrará en la barra de navegación. */
  logoUrl: string = './assets/img/logoUART.jpg';
  /** Se define la primera línea del título principal de la aplicación. */
  titleLine1: string = 'Sistema Digesto 2025';
  /** Se define la segunda línea del título, generalmente para indicar la versión o un subtítulo. */
  titleLine2: string = 'Versión Prototipo';

  /** @section Configuración de Formularios */

  /** * Se define la apariencia global para los campos de formulario de Angular Material.
   * Valores posibles: 'fill', 'outline', 'standard', 'legacy'.
   */
  formFieldAppearance: MatFormFieldAppearance = 'outline';

  /**
   * @constructor
   * El constructor del servicio. Actualmente no realiza ninguna acción.
   */
  constructor() { }
}
