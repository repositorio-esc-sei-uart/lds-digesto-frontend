import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
// Módulos de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Servicios y Tipos
import { DocumentService } from '../../services/document-service';
import { Documento } from '../../interfaces/document-model';
import { filter, map, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

/**
 * @Component
 * Se define el componente encargado de mostrar el detalle de un documento específico.
 */
@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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

  constructor (
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      // Obtiene el ID como string y lo convierte a número
      map(params => parseInt(params.get('id')!, 10)),

      // Filtro de protección para IDs inválidos (NaN)
      filter(id => !isNaN(id)),

      // Usa switchMap para obtener el documento principal
      switchMap(id => this.documentService.getDocumentoById(id)),

      tap(documento => {
        console.log("URL original del archivo:", documento?.archivos?.[0]?.url);
        if (documento?.archivos) {
        documento.archivos = documento.archivos.map(archivo => ({
          ...archivo,
          url: `${environment.apiUrl}/api/v1/archivos/${archivo.idArchivo}/${archivo.nombre}`
        }));
      }

      console.log("URL corregida:", documento?.archivos?.[0]?.url);
      })

    ).subscribe(documentoEncontrado => {
      // Asigna el resultado.
      this.documento = documentoEncontrado;
    });
  }
}
