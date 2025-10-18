/**
 * @fileoverview Definición de las rutas de navegación de la aplicación.
 * @description Se mapea cada URL a un componente específico de Angular,
 * permitiendo la navegación entre las diferentes vistas de la aplicación.
 */

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { DocumentDetail } from './pages/document-detail/document-detail';

/**
 * @const routes
 * Se define un arreglo que contiene la configuración de todas las rutas de la aplicación.
 */
export const routes: Routes = [
  // Se define una ruta de redirección.
  // Si un usuario navega a la raíz del sitio (''), se le redirige automáticamente a '/home'.
  // `pathMatch: 'full'` asegura que solo se active si la ruta está completamente vacía.
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Se define la ruta principal de la aplicación.
  // Cuando un usuario navega a '/home', se carga el componente `HomeComponent`.
  { path: 'home', component: HomeComponent },

  // Se define una ruta dinámica para mostrar el detalle de un documento.
  // El `:id` es un parámetro que cambiará según el documento que se quiera ver.
  // Por ejemplo, '/documento/1' cargará `DocumentDetail` y le pasará el ID '1'.
  { path: 'documento/:id', component: DocumentDetail },
];
