/**
 * @fileoverview Definición de las rutas de navegación de la aplicación.
 * @description Se mapea cada URL a un componente específico de Angular,
 * permitiendo la navegación entre las diferentes vistas de la aplicación.
 */

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { DocumentDetail } from './pages/document-detail/document-detail';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard-component/dashboard-component';
import { authGuard } from './guards/auth-guard';
import { DocumentManagementComponent } from './pages/dashboard/document-management-component/document-management-component';
import { UserManagementComponent } from './pages/dashboard/user-management-component/user-management-component';

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

  // Se define la ruta para la página de inicio de sesión.
  // Cuando un usuario navega a '/login', se carga el componente `LoginComponent`.
  { path: 'login', component: LoginComponent },

  // --- Se protege la ruta del Dashboard ---
  // Esta es la configuración de la ruta principal del dashboard.
  {
    path: 'dashboard',
    component: DashboardComponent,
    // Aquí le decimos a Angular: "Antes de activar esta ruta y mostrar
    // DashboardComponent, ejecuta el 'authGuard'".
    canActivate: [authGuard],
    // Se definen las rutas hijas que se mostrarán DENTRO del DashboardComponent
    children: [
      { path: '', redirectTo: 'documentos', pathMatch: 'full' }, // Redirige /dashboard a /dashboard/documentos
      { path: 'documentos', component: DocumentManagementComponent },
      { path: 'usuarios', component: UserManagementComponent } // Protegeremos esta con un guardia de rol más adelante
    ]
  },
];
