import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
// Servicios y Tipos
import { GlobalConfigurationService } from '../../services/global-configuration-service';
import { Documento, DocumentoListItem, DocumentService } from '../../services/document-service';
import { TipoDocumento, TypeDocumentService } from '../../services/type-document-service';
import { SearchService } from '../../services/search-service';

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
    MatTooltipModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  /** Almacena la lista completa de documentos obtenida del servicio. */
  todosLosDocumentos: DocumentoListItem[] = [];
  /** Almacena la lista de documentos que se muestra en la vista, después de aplicar filtros. */
  documentosFiltrados: DocumentoListItem[] = [];
  /** Almacena la lista de tipos de documento para generar los botones de filtro. */
  tiposDeDocumento: TipoDocumento[] = [];
  /** Guarda la categoría actualmente seleccionada por el usuario. */
  categoriaSeleccionada: string = 'todos';
  /** Guarda el término de búsqueda actual proveniente del header. */
  terminoDeBusqueda: string = '';

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
    private router: Router
  ) {}

  /**
   * @LifecycleHook ngOnInit
   * Se ejecuta al iniciar el componente. Carga los datos iniciales y se suscribe al servicio de búsqueda.
   */
  ngOnInit(): void {
    // Se obtienen los datos de los servicios.
    this.todosLosDocumentos = this.documentService.getDocumentos();
    this.tiposDeDocumento = this.typeDocumentService.getTiposDocumento();

    // Se suscribe a los cambios en el término de búsqueda.
    this.searchService.searchTerm$.subscribe(term => {
      this.terminoDeBusqueda = term;
      this.aplicarFiltros(); // Se reaplican los filtros cada vez que cambia la búsqueda.
    });

    // Se aplica el filtro inicial para mostrar todos los documentos.
    this.aplicarFiltros();
  }

  /**
   * Se ejecuta cuando el usuario hace clic en un botón de categoría.
   * @param category La categoría seleccionada (ej. 'Resoluciones', 'Disposiciones' o 'todos').
   */
  selectCategory(category: string): void {
    this.categoriaSeleccionada = category;
    this.aplicarFiltros(); // Se vuelven a aplicar los filtros con la nueva categoría.
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
  private aplicarFiltros(): void {
    let documentos = this.todosLosDocumentos;

    // Primero, se filtra por la categoría seleccionada.
    if (this.categoriaSeleccionada !== 'todos') {
      documentos = documentos.filter(doc => doc.tipoDocumento === this.categoriaSeleccionada);
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
  }
}
