import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
// Servicios y Tipos
import { GlobalConfigurationService } from '../../services/global-configuration-service';
import { DocumentService } from '../../services/document-service';
import { TypeDocumentService } from '../../services/type-document-service';
import { SearchService } from '../../services/search-service';
import { DocumentoListItem } from '../../interfaces/document-model';
import { TipoDocumento } from '../../interfaces/type-document-model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConteoTipos } from '../../interfaces/conteo-model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdvancedSearch } from '../advanced-search/advanced-search';
import { Subject, takeUntil } from 'rxjs';
import { AdvancedFilter } from '../../interfaces/advanced-filter-model';

/**
 * @Component
 * Se define el componente principal de la página de inicio.
 * Se encarga de mostrar los documentos, permitir filtrarlos por categoría y por búsqueda de texto.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule
],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class HomeComponent implements OnInit, OnDestroy {

  /** Almacena la lista completa de documentos obtenida del servicio. */
  todosLosDocumentos: DocumentoListItem[] = [];
  /** Almacena la lista de documentos que se muestra en la vista, después de aplicar filtros. */
  documentosFiltrados: DocumentoListItem[] = [];
  /** Almacena la lista de tipos de documento para generar los botones de filtro. */
  tiposDeDocumento: TipoDocumento[] = [];
  conteoPorTipo: ConteoTipos = {}; // Guarda el conteo de documentos por tipo
  totalDocumentos = 0; // Guarda el conteo total de documentos
  /** Guarda la categoría actualmente seleccionada por el usuario. */
  categoriaSeleccionada: string = 'todos';
  /** Guarda el ID del tipo de documento seleccionado (si aplica). */
  idTipoSeleccionado?: number;
  /** Guarda el término de búsqueda actual proveniente del header. */
  terminoDeBusqueda: string = '';
  filtrosAvanzados: AdvancedFilter = {};
  private destroy$ = new Subject<void>();

  // Variables de paginación
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  /**
   * Se inyectan todos los servicios necesarios para el funcionamiento del componente.
   * @param configService Para configuraciones globales.
   * @param documentService Para obtener la lista de documentos.
   * @param typeDocumentService Para obtener los tipos de documento.
   * @param searchService Para recibir actualizaciones del término de búsqueda.
   * @param router Para navegar a otras vistas.
   */
  constructor(
    public configService: GlobalConfigurationService,
    private documentService: DocumentService,
    private typeDocumentService: TypeDocumentService,
    private searchService: SearchService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @LifecycleHook ngOnInit
   * Se ejecuta al iniciar el componente. Carga los datos iniciales y se suscribe al servicio de búsqueda.
   */
  ngOnInit(): void {
    // Carga documentos con paginación
    this.cargarDocumentos();
    // Carga conteos por tipo
    this.cargarTiposYConteos();

    this.searchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.terminoDeBusqueda = term;

        // Si el usuario escribe en la barra simple, borramos los filtros avanzados
        if (term.trim() !== '') {
          this.filtrosAvanzados = {};
        }
        this.currentPage = 0;
        this.cargarDocumentos();
      });

    // 3. SUSCRIPCIÓN A BÚSQUEDA AVANZADA (¡LA PIEZA FALTANTE!)
    this.searchService.filtrosAvanzados$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filtros: any) => {
        this.filtrosAvanzados = this.limpiarFiltrosNulos(filtros);

        // Limpia búsqueda simple
        this.terminoDeBusqueda = '';
        this.searchService.actualizarBusqueda('');

        this.currentPage = 0;
        this.cargarDocumentos();
      });
  }

  /**
   * Carga documentos desde el backend con paginación y filtro opcional
   */
  cargarDocumentos(): void {
    // 1. Detecta si se está usando la búsqueda avanzada
    const esAvanzada = this.filtrosAvanzados && Object.keys(this.filtrosAvanzados).length > 0;

    // 2. Llama al servicio con los 5 ARGUMENTOS en el orden correcto
    this.documentService.getDocumentos(

      // Arg 1: page (number)
      this.currentPage,

      // Arg 2: size (number)
      this.pageSize,

      // Arg 3: search (string | undefined)
      // Si es avanzada, pasa undefined. Si no, pasa el término de la barra simple.
      esAvanzada ? undefined : (this.terminoDeBusqueda.trim() || undefined),

      // Arg 4: idTipoDocumento (number | undefined)
      // Si es avanzada, pasa undefined (porque el tipo va DENTRO del objeto avanzado).
      // Si no, pasa el idTipoSeleccionado de los botones del home.
      esAvanzada ? undefined : this.idTipoSeleccionado,

      // Arg 5: filtrosAvanzados (AdvancedFilter | undefined)
      // Si es avanzada, pasa el objeto de filtros. Si no, pasa undefined.
      esAvanzada ? this.filtrosAvanzados : undefined,
      true // soloActivos: boolean

    ).subscribe(response => {
      this.documentosFiltrados = response.content;
      this.totalElements = response.totalElements;
      this.totalPages = response.totalPages;
      // no se si es un bug lo de abajo pero si no es, se descomenta la linea siguiente.
      // este bug cambia el total de documentos mostrados en los botones de categoria por el tipo de documento
      //this.totalDocumentos = response.totalElements;
    });

  }

  /**
   * Carga tipos de documento y sus conteos
   */
  cargarTiposYConteos(): void {
    // Carga tipos
    this.typeDocumentService.getTiposDocumento().subscribe(tipos => {
      this.tiposDeDocumento = tipos;
    });

    // Carga conteos
    this.documentService.getCountByType().subscribe(conteos => {
      this.conteoPorTipo = conteos;
      // Calcula total
      this.totalDocumentos = Object.values(conteos).reduce((sum, count) => sum + count, 0);
    });
  }

  /**
   * Se ejecuta cuando el usuario hace clic en un botón de categoría.
   * @param category La categoría seleccionada (ej. 'Resoluciones', 'Disposiciones' o 'todos').
   */
  selectCategory(category: string, idTipo?: number): void {
    this.categoriaSeleccionada = category;
    this.idTipoSeleccionado = idTipo;  // undefined si es "todos"
    this.currentPage = 0;  // Resetea a la primera página
    this.cargarDocumentos();  // Recarga con el filtro
  }

  /**
   * Se ejecuta cuando el usuario cambia de página
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarDocumentos();  // Mantiene el filtro actual
  }

  /**
   * Se navega a la vista de detalle del documento correspondiente.
   * @param documentoId El ID del documento sobre el que se hizo clic.
   */
  onCardClick(documentoId: number): void {
    this.router.navigate(['/documento', documentoId]);
  }

  /**
   * Se centraliza la lógica de filtrado. Se aplica el filtro por categoría y luego por término de búsqueda.
   * Esta función es llamada cada vez que cambia la categoría o el término de búsqueda.
   */
  /** private aplicarFiltros(): void {
    let documentos = this.todosLosDocumentos;

    // Primero, se filtra por la categoría seleccionada.
    if (this.categoriaSeleccionada !== 'todos') {
      documentos = documentos.filter(doc => doc.tipoDocumento.nombre === this.categoriaSeleccionada);
    }

    // Segundo, sobre el resultado anterior, se filtra por el término de búsqueda.
    if (this.terminoDeBusqueda) {
      const lowerCaseTerm = this.terminoDeBusqueda.toLowerCase();
      documentos = documentos.filter(doc =>
        doc.titulo.toLowerCase().includes(lowerCaseTerm) ||
        doc.resumen.toLowerCase().includes(lowerCaseTerm) ||
        doc.numDocumento.toLowerCase().includes(lowerCaseTerm)
      );
    }

    // Finalmente, se actualiza la lista de documentos a mostrar.
    this.documentosFiltrados = documentos;
  }*/
 /**
   * MÉTODO NUEVO: Abre el modal de búsqueda avanzada
   */
  abrirModalAvanzado(): void {
    const dialogRef = this.dialog.open(AdvancedSearch, {
      width: '700px', // Ancho del modal
      data: this.filtrosAvanzados // Pasa los filtros actuales para rellenar el formulario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.filtrosAvanzados = this.limpiarFiltrosNulos(result);

        this.terminoDeBusqueda = '';

        this.searchService.actualizarBusqueda('');

        this.currentPage = 0;
        this.cargarDocumentos();
      }
    });
  }

  /**
   * MÉTODO NUEVO: Limpia el objeto del formulario para no enviar {titulo: null} al backend
   */
  private limpiarFiltrosNulos(filtros: any): AdvancedFilter {
    const filtrosLimpios: any = {};

    // Itera sobre las claves del objeto formulario
    Object.keys(filtros).forEach(key => {
      const value = filtros[key];
      // Añade la clave solo si tiene un valor real
      if (value !== null && value !== undefined && value !== '') {
        filtrosLimpios[key] = value;
      }
    });

    if (filtrosLimpios.fechaDesde) {
      const fechaStr = this.formatearFechaLocal(filtrosLimpios.fechaDesde);
      delete filtrosLimpios.fechaDesde; // ⬅️ Eliminar el campo viejo
      filtrosLimpios.fechaDesdeStr = fechaStr; // ⬅️ Agregar con el nombre correcto
    }

    if (filtrosLimpios.fechaHasta) {
      const fechaStr = this.formatearFechaLocal(filtrosLimpios.fechaHasta);
      delete filtrosLimpios.fechaHasta; // ⬅️ Eliminar el campo viejo
      filtrosLimpios.fechaHastaStr = fechaStr; // ⬅️ Agregar con el nombre correcto
    }

    return filtrosLimpios as AdvancedFilter;
  }

  // Helper method (si no lo tenés ya)
  private formatearFechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Devuelve 'true' si CUALQUIER filtro está activo.
   */
  get isFilterActive(): boolean {
    const isSearchSimpleActive = this.terminoDeBusqueda.trim() !== '';
    const isSearchAdvancedActive = this.filtrosAvanzados && Object.keys(this.filtrosAvanzados).length > 0;
    const isTypeFilterActive = this.idTipoSeleccionado !== undefined; // 'undefined' es 'Todos'

    return isSearchSimpleActive || isSearchAdvancedActive || isTypeFilterActive;
  }

  /**
   * Resetea TODOS los filtros a su estado inicial y recarga los documentos.
   */
  limpiarTodosLosFiltros(): void {
    // Limpia los estados del HomeComponent
    this.terminoDeBusqueda = '';
    this.filtrosAvanzados = {};
    this.idTipoSeleccionado = undefined;
    this.categoriaSeleccionada = 'todos'; // Resetea el botón de tipo
    this.currentPage = 0; // Vuelve a la página 1

    // Limpia la barra de búsqueda (importante)
    this.searchService.actualizarBusqueda('');
    this.searchService.limpiarTodo();

    // Recarga los documentos
    this.cargarDocumentos();
  }
}
