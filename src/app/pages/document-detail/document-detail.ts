import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, Optional } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
// Módulos de Angular Material
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Servicios y Tipos
import { AuthenticationService } from '../../services/authentication-service';
import { DocumentService } from '../../services/document-service';
import { Documento } from '../../interfaces/document-model';
import { filter, map, switchMap, tap } from 'rxjs';

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
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.css'
})
export class DocumentDetail implements OnInit {

  public apiUrl: string = environment.apiUrl;
  /** Almacena los datos completos del documento a mostrar. */
  documento?: Documento;
  isDialog: boolean = false;
  canViewInactive: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    @Optional() public dialogRef: MatDialogRef<DocumentDetail>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: { id: number },
    private authService: AuthenticationService
  ) { 
    // Si data existe, significa que se abrió como modal
    if (this.data && this.data.id) {
      this.isDialog = true;
    }
  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user && (user.rol?.nombre === 'Administrador' || user.rol?.nombre === 'Editor')) {
      this.canViewInactive = true;
    }
    if (this.isDialog) {
      // LÓGICA MODAL: Usamos el ID que viene por inyección
      this.cargarDocumento(this.data.id);
    } else {
      // LÓGICA PÁGINA: Usamos la URL
      this.route.paramMap.pipe(
         // Obtiene el ID como string y lo convierte a número
        map(params => parseInt(params.get('id')!, 10)),
        filter(id => !isNaN(id))
      ).subscribe(id => {
        this.cargarDocumento(id);
      });
    }
  }
  private cargarDocumento(id: number): void {
    this.documentService.getDocumentoById(id).pipe(tap(documento => {
        if (documento?.archivos) {
          documento.archivos = documento.archivos.map(archivo => ({
            ...archivo,
            url: `${environment.apiUrl}/api/v1/archivos/${archivo.idArchivo}/${archivo.nombre}`
          }));
        }
      })
    ).subscribe(documentoEncontrado => {
      // Asigna el resultado.
      this.documento = documentoEncontrado;
    });
  }
  /**
   * Maneja el clic en un documento relacionado.
   * Si es modal: Evita la navegación y recarga los datos en el mismo modal.
   * Si es página: Deja que el routerLink navegue normalmente.
   */
  onReferenceClick(event: Event, id: number): void {
    if (this.isDialog) {
      // 1. Detenemos la navegación por defecto del routerLink
      event.preventDefault(); 
      
      // 2. Recargamos el documento actual con el nuevo ID dentro del mismo modal
      this.cargarDocumento(id);
    }
    // Si no es diálogo, no hacemos nada y dejamos que [routerLink] funcione.
  }
  // Método para cerrar el modal manualmente
  cerrarModal(): void {
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    }
  }
}


