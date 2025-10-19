import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication-service';

/**
 * @const authGuard
 * Guardia de ruta funcional para proteger las rutas que requieren autenticación.
 * Esta es la implementación moderna y recomendada de los guardias en Angular.
 *
 * @description
 * 1. Inyecta el Router y el AuthenticationService.
 * 2. Llama al AuthenticationService para verificar si hay un usuario con sesión activa.
 * 3. Si hay un usuario, permite el acceso a la ruta (`return true`).
 * 4. Si NO hay un usuario, redirige a la página de login (`/login`) y bloquea el acceso (`return false`).
 *
 * Este guardia responde a la pregunta: "¿Puede el usuario entrar a esta sección?"
 * No se preocupa por el ROL, solo por si está o no autenticado.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Se inyectan los servicios necesarios dentro de la función del guardia.
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Se verifica si existe un usuario con sesión activa consultando el servicio.
  if (authService.currentUserValue) {
    // Si hay un usuario, se permite la navegación.
    return true;
  }

  // Si no hay un usuario, se redirige a la página de login.
  console.log('AuthGuard: Acceso denegado. Usuario no autenticado. Redirigiendo a /login.');
  router.navigate(['/login']);
  // Y se bloquea la navegación a la ruta protegida.
  return false;
};
