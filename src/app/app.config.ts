import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // FUNDAMENTAL: Habilita el uso de HttpClient en toda la aplicación.
    // Sin esto, cualquier servicio (como AuthenticationService) que intente
    // inyectar HttpClient fallará, rompiendo la aplicación.
    provideHttpClient(),
  ]
};
