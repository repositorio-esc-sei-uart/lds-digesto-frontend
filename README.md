# LDS - Sistema de Digesto Institucional (Prototipo Frontend)

Este repositorio contiene el código fuente del **prototipo del frontend** para un sistema de **Digesto Digital**, desarrollado en el marco de la materia **Laboratorio de Desarrollo de Software (LDS)**.  

La aplicación se encargará de la **interfaz de usuario**, permitiendo la **visualización**, **búsqueda** y, la **gestión de documentos normativos**.

---

## Funcionalidades Implementadas

### Visualización y Búsqueda Pública
- Listado de documentos en **tarjetas interactivas**.  
- **Filtrado** por tipo de documento.  
- **Búsqueda en tiempo real** en el encabezado.  
- **Vista de detalle** completa de cada documento.  

### Autenticación y Sesión
- Flujo de **login** a través de un diálogo modal.  
- Gestión de estado de sesión con persistencia.  
- Header dinámico que muestra el estado de sesión (**Acceder / Salir**).  

### Dashboard Protegido
- Acceso restringido a `/dashboard` solo para usuarios autenticados (**authGuard**).  
- Sección de **Gestión de Usuarios** protegida por rol (**roleGuard**), visible solo para administradores.  
- Sidebar dinámico con información y enlaces según el rol del usuario.  

### Diseño Responsivo
- Interfaz adaptable a **móviles, tablets y escritorio**.  

---

## Arquitectura del Frontend

La aplicación sigue una **arquitectura basada en componentes y servicios**, separando responsabilidades y maximizando la reutilización del código.

### Componentes Principales
- **AppComponent**: raíz con Header, Footer y `router-outlet`.  
- **HeaderComponent**: encabezado global con búsqueda y estado de sesión.  
- **FooterComponent**: pie de página con información de contacto.  
- **HomeComponent**: página principal con grilla de documentos públicos.  
- **DocumentDetailComponent**: vista detallada de un documento.  
- **LoginComponent**: formulario modal de inicio de sesión.  
- **DashboardComponent**: layout principal de administración con Sidebar.  
- **SidebarComponent**: barra lateral dinámica con navegación según rol.  

### Servicios Centrales
- **AuthenticationService**: gestiona login, logout y perfil de usuario.  
- **DocumentService**: provee datos de documentos (mock data).  
- **SearchService**: comunica el término de búsqueda entre Header ↔ Home.  
- **GlobalConfigurationService**: almacena configuraciones globales.  

### Guardias de Ruta
- **auth.guard.ts**: protege rutas para usuarios autenticados.  
- **role.guard.ts**: protege rutas según rol del usuario.  

---

## Tecnologías Utilizadas

- **Framework**: Angular v20  
- **UI Library**: Angular Material  
- **Estilos**: CSS con variables globales  

---

## Puesta en Marcha para Desarrollo

### Instalación
Sigue estos pasos para configurar el proyecto en tu entorno local:

1. Clona el repositorio: Abre tu terminal y ejecuta el siguiente comando, reemplazando <url_del_repositorio> con la URL de tu repositorio Git. 
```bash
git clone <url_del_repositorio>
```

2. Navega a la carpeta del proyecto
```bash
cd <nombre-de-la-carpeta-del-proyecto>
```

3. Instala las dependencias:
```bash
npm install
```

4. Ejecuta el servidor:
```bash
ng serve -o
```
- El comando ng serve compila la aplicación y la levanta en un servidor local.
- La bandera -o (o --open) abrirá automáticamente tu navegador en http://localhost:4200/.

La aplicación se recargará automáticamente cada vez que guardes cambios en alguno de los archivos del proyecto.
