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

  // Se obtiene el rol esperado desde la configuración de la ruta
  const expectedRoles = route.data['expectedRoles'] as string[];
  const currentUser = authService.currentUserValue;

  // Si no hay un usuario logueado o su rol no coincide con el esperado
  if (!currentUser || !expectedRoles || expectedRoles.length === 0) {
    console.error('RoleGuard: Acceso denegado. No hay usuario o no se definieron roles para la ruta.');
    router.navigate(['/dashboard']);
    return false;
  }

  // Si el rol del usuario coincide con el esperado, se permite el acceso CAMBIO DEL .NOMBRE
  if (expectedRoles.includes(currentUser.rol.nombre)) {
    return true;
  }

  // Si no coincide, se bloquea el acceso.
  console.error(
    `RoleGuard: Acceso denegado. Se requiere uno de los roles: [${expectedRoles.join(', ')}]`,
    `pero el usuario tiene el rol: '${currentUser.rol}'.`
  );

  // Se redirige a una página segura (la raíz del dashboard)
  router.navigate(['/dashboard']);
  return false;
};
