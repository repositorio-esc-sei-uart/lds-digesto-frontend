import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication-service';

/**
 * @const roleGuard
 * Guardia de ruta funcional para proteger rutas basadas en el rol del usuario.
 *
 * @description
 * 1. Obtiene el rol esperado desde la propiedad 'data' de la configuración de la ruta.
 * 2. Llama al AuthenticationService para obtener el perfil del usuario actual.
 * 3. Compara el rol del usuario con el rol esperado.
 * 4. Si el usuario no existe o su rol no coincide, bloquea el acceso y lo redirige
 * a una página segura (en este caso, la página principal del dashboard).
 * 5. Si el rol coincide, permite el acceso.
 *
 * Este guardia responde a la pregunta: "¿Tiene este usuario el permiso para ver esta página específica?"
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Se obtiene el rol esperado desde la configuración de la ruta.
  const expectedRole = route.data['expectedRole'];

  // Se obtiene el usuario actual desde el servicio de autenticación.
  const currentUser = authService.currentUserValue;

  // Si no hay un usuario logueado o su rol no coincide con el esperado...
  if (!currentUser || currentUser.rol !== expectedRole) {
    console.error(`RoleGuard: Acceso denegado. Se requiere el rol '${expectedRole}' pero el usuario tiene el rol '${currentUser?.rol || 'ninguno'}'.`);

    // ...lo redirigimos a una página segura (la raíz del dashboard).
    router.navigate(['/dashboard']);
    return false; // Se bloquea el acceso.
  }

  // Si el rol del usuario coincide con el esperado, se permite el acceso.
  return true;
};
