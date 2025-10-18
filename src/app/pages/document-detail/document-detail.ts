import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Servicios y Tipos
import { Documento, DocumentService } from '../../services/document-service';

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

  /** Se declara una propiedad para almacenar los datos del documento a mostrar. Puede ser indefinido si no se encuentra. */
  documento?: Documento;

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
    // Se obtiene el parámetro 'id' de la URL actual.
    const idString = this.route.snapshot.paramMap.get('id');

    // Se verifica que el ID exista en la URL.
    if (idString) {
      // Se convierte el ID de string a número.
      const documentoId = parseInt(idString, 10);

      // Se utiliza el servicio para buscar el documento por su ID y se asigna a la propiedad local.
      this.documento = this.documentService.getDocumentoById(documentoId);
    }
  }
}
