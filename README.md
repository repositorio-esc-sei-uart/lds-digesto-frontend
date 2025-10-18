# LDS - Sistema de Digesto Institucional (Prototipo Frontend)

Este repositorio contiene el código fuente del **prototipo del frontend** para un sistema de **Digesto Digital**, desarrollado en el marco de la materia **Laboratorio de Desarrollo de Software (LDS)**.  

La aplicación se encarga de la **interfaz de usuario**, permitiendo la **visualización** y **búsqueda** de documentos normativos.

---

## Funcionalidades Implementadas

- **Visualización de Documentos**: lista de todos los documentos disponibles en tarjetas interactivas.  
- **Filtrado por Categoría**: permite filtrar los documentos por su tipo (Resoluciones, Ordenanzas, etc.).  
- **Búsqueda en Tiempo Real**: barra de búsqueda en el encabezado que filtra los resultados mientras el usuario escribe.  
- **Vista de Detalle**: al hacer clic en un documento, se navega a una vista dedicada con toda su información.  
- **Diseño Responsivo**: interfaz adaptable a dispositivos móviles, tablets y escritorio.  

---

## Arquitectura del Frontend

La aplicación sigue una **arquitectura basada en componentes y servicios**, separando responsabilidades y maximizando la reutilización del código.

### 🔹 Componentes Principales
- **HeaderComponent**: encabezado principal con logo, título y búsqueda global.  
- **FooterComponent**: pie de página con información de contacto y enlaces a redes sociales.  
- **HomeComponent**: página principal con grilla de documentos y botones de filtrado.  
- **DocumentDetailComponent**: vista detallada de un documento seleccionado.  
- **LoginComponent**: formulario modal de inicio de sesión.  

### 🔹 Servicios Centrales
- **DocumentService**: provee los datos de los documentos (mock data, preparado para API backend).  
- **TypeDocumentService**: gestiona los tipos de documentos disponibles para el filtrado.  
- **SearchService**: maneja el estado de la búsqueda de forma centralizada, conectando Header ↔ Home.  
- **GlobalConfigurationService**: almacena configuraciones globales (títulos, logos, etc.).  

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular v20  
- **UI Library**: Angular Material  
- **Estilos**: CSS con variables globales  

---

