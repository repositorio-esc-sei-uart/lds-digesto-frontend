import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication-service';

/**
 * @const roleGuard
 * Guardia de ruta funcional para proteger rutas basadas en el rol del usuario.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  // Se obtiene el rol esperado desde la configuración de la ruta
  const expectedRoles = route.data['expectedRoles'] as string[];
  const currentUser = authService.currentUserValue;

  // --- PRIMERA VERIFICACIÓN: Usuario y Roles en la Ruta ---
  // Si no hay un usuario logueado, se bloquea.
  // Si no se definieron roles esperados en la ruta, también se bloquea por seguridad.
  if (!currentUser || !expectedRoles || expectedRoles.length === 0) {
    console.error('RoleGuard: Acceso denegado. No hay usuario logueado o no se definieron roles para la ruta.');
    router.navigate(['/dashboard']);
    return false;
  }
  
  // --- VERIFICACIÓN DE ROL DEL USUARIO (Corrección del Error de Tipado) ---
  
  // 1. Obtener el nombre del rol del usuario de forma segura.
  // El tipo será string | undefined.
  const userRoleName = currentUser.rol?.nombre;
  
  // 2. Verificar que el rol exista y esté incluido en los roles esperados.
  // La primera condición (userRoleName) garantiza que no es undefined, resolviendo el error de tipado.
  if (userRoleName && expectedRoles.includes(userRoleName)) {
    return true;
  }

  // --- ACCESO DENEGADO Y REDIRECCIÓN ---
  
  // Si no coincide, se bloquea el acceso.
  console.error(
    `RoleGuard: Acceso denegado. Se requiere uno de los roles: [${expectedRoles.join(', ')}]`,
    // Corrección de la lógica de error: muestra el nombre del rol, o un mensaje si no existe
    `pero el usuario tiene el rol: '${userRoleName || 'NO ASIGNADO'}.'`
  );

  // Se redirige a una página segura (la raíz del dashboard)
  router.navigate(['/dashboard']);
  return false;
};