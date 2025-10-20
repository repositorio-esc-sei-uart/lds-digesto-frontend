import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Servicios y Tipos
import { DocumentService } from '../../services/document-service';
import { Documento, DocumentoListItem } from '../../interfaces/document-model';

/**
 * @Component
 * Se define el componente encargado de mostrar el detalle de un documento específico.
 * Obtiene el ID del documento desde la URL y utiliza un servicio para cargar sus datos.
 */
@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule, // Se importa para usar directivas como ngIf, ngFor, y pipes.
    RouterModule, // Se importa para funcionalidades de enrutamiento como routerLink.
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.css'
})
export class DocumentDetail implements OnInit {

  /** Almacena los datos completos del documento a mostrar. */
  documento?: Documento;

  /**
   * Se declara e inicializa la propiedad para las referencias.
   * Almacenará los detalles de los documentos referenciados.
   */
  documentosReferenciados: DocumentoListItem[] = [];

  /**
   * Se inyectan las dependencias necesarias.
   * @param route Servicio para acceder a la información de la ruta activa, como los parámetros de la URL.
   * @param documentService Servicio que provee la lógica para obtener los datos de los documentos.
   */
  constructor (
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  /**
   * @LifecycleHook ngOnInit
   * Se ejecuta al inicializar el componente. Es el lugar ideal para obtener datos iniciales.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idString = params.get('id');

      if (idString) {
        const documentoId = parseInt(idString, 10);
        this.documento = this.documentService.getDocumentoById(documentoId);

        // Se resetea la lista de referencias para evitar duplicados al navegar.
        this.documentosReferenciados = [];

        if (this.documento && this.documento.referencias.length > 0) {
          this.documento.referencias.forEach(refId => {
            const docReferenciado = this.documentService.getDocumentoById(refId);

            if (docReferenciado) {
              // Se convierte el Documento completo a DocumentoListItem
              // y se añade al array para que el HTML lo pueda mostrar.
              this.documentosReferenciados.push({
                idDocumento: docReferenciado.idDocumento,
                titulo: docReferenciado.titulo,
                numDocumento: docReferenciado.numDocumento,
                fechaCreacion: docReferenciado.fechaCreacion,
                resumen: docReferenciado.resumen,
                tipoDocumento: docReferenciado.tipoDocumento
              });
            }
          });
        }
      }
    });
  }

  getNumDocumento(id: number): string {
    const doc = this.documentService.getDocumentoById(id);
    return doc ? doc.numDocumento : `Documento ${id}`;
  }
}
