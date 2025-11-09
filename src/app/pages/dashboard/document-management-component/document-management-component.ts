import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog';
// Módulos de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Servicios y Interfaces
import { DocumentService } from '../../../services/document-service';
import { DocumentoListItem } from '../../../interfaces/document-model';
import { MatDialog } from '@angular/material/dialog';
import { DocumentDetail } from '../../document-detail/document-detail';
import { DocumentForm } from '../document-form/document-form';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-management-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    MatSnackBarModule,
  ],
  templateUrl: './document-management-component.html',
  styleUrl: './document-management-component.css'
})
export class DocumentManagementComponent implements OnInit {
  // Columnas que mostrará la tabla
  displayedColumns: string[] = ['numDocumento', 'titulo', 'tipoDocumento', 'fechaCreacion', 'estado', 'acciones'];

  // Usamos el 'DocumentoListItem' que definimos, ¡es perfecto para esto!
  dataSource: DocumentoListItem[] = [];
  isLoading = true;

  // Inyectar MatDialog usando inject()
  private dialog = inject(MatDialog);

  constructor(private documentService: DocumentService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadDocumentos();
  }

  loadDocumentos(): void {
    this.isLoading = true;
    this.documentService.getDocumentos(0, 100).subscribe({
      next: (response) => {
        this.dataSource = response.content;;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar documentos:", err);
        this.isLoading = false;
      },
    });
  }

  openNewDocumentDialog(): void {
    const dialogRef = this.dialog.open(DocumentForm, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true, // Evita que se cierre al hacer clic fuera
      data: { isEditMode: false } // Pasamos datos (útil para reutilizar en "Editar")
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si el modal devolvió 'true' (éxito)
        // 1. MOSTRAMOS LA NOTIFICACIÓN DE ÉXITO AQUÍ
        this.snackBar.open('¡Documento guardado exitosamente!', '', { // Sin botón
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar']
        });
        console.log('Documento creado, refrescando la tabla...');
        this.loadDocumentos(); // se recargan los datos!
      }
    });
  }
  /**
   * Abre el modal de edición.
   * Primero, busca el documento completo por su ID para pasarlo al formulario.
   */
  openEditDocumentDialog(documento: DocumentoListItem): void {
    // 1. Mostrar spinner mientras se buscan los datos
    this.isLoading = true;

    // 2. Buscar el documento completo por ID
    this.documentService.getDocumentoParaEdicion(documento.idDocumento).subscribe({
    next: (documentoCompleto) => {
        this.isLoading = false; // Ocultar spinner

        if (!documentoCompleto) {
          this.snackBar.open('Error: No se pudieron cargar los datos para editar.', 'Cerrar', { panelClass: ['error-snackbar'] });
          return;
        }

        // 3. Abrir el modal CON los datos completos
        const dialogRef = this.dialog.open(DocumentForm, {
          width: '700px',
          maxWidth: '90vw',
          disableClose: true,
          data: {
            isEditMode: true,
            documento: documentoCompleto // Pasamos el objeto 'Documento' completo
          }
        });

        // 4. Escuchar el resultado
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.snackBar.open('¡Documento actualizado exitosamente!', '', {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar']
            });
            this.loadDocumentos(); // Recargar la tabla
          }
        });

      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error al cargar documento para editar:", err);
        this.snackBar.open('Error al cargar los datos del documento.', 'Cerrar', { panelClass: ['error-snackbar'] });
      }
    });
  }
  /**
   * Devuelve una clase CSS basada en el nombre del estado para estilizar el chip.
   * @param statusName El nombre del estado (ej. "vigente", "derogado total")
   */
  getStatusClass(statusName: string): string {
    const status = statusName.toLowerCase();
    if (status.includes('vigente')) {
      return 'status-vigente';
    } else if (status === 'derogado parcial') {
      return 'status-derogado-parcial';
    } else if (status === 'derogado total') {
      return 'status-derogado-total';
    }
    return 'status-otro';
  }

  /**
   * Abre un diálogo modal para previsualizar el detalle de un documento.
   * @param documentoId El ID del documento a previsualizar.

  openPreviewModal(documentoId: number): void {
    const dialogRef = this.dialog.open(DocumentDetail, { // Abre el componente DocumentDetail
      width: '85%',              // Ancho del modal
      maxWidth: '1000px',        // Ancho máximo
      height: '80vh',            // Alto relativo a la ventana
      panelClass: 'preview-dialog-container', // Clase CSS opcional para estilizar el modal
      data: { id: documentoId } // Pasamos el ID como dato al modal
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo de previsualización se cerró:', result);
    });
  }
  */
  // Lógica para el filtro de la tabla
  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
    // NOTA: La lógica de filtro se implementará cuando se conecte a MatPaginator y MatSort
    console.log("Filtrando...", (event.target as HTMLInputElement).value);
  }

  onDelete(docId: number, docNum: string): void {
    // 1. Abre el modal de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que deseas eliminar el documento "${docNum}"? Esta acción no se puede deshacer.`
      }
    });

    // 2. Escucha el resultado
    dialogRef.afterClosed().subscribe(result => {
      // 3. Si el usuario confirmó (result === true)
      if (result === true) {
        this.isLoading = true;
        this.documentService.deleteDocumento(docId).subscribe({
          next: () => {
            this.isLoading = false;
            // Notificación de éxito
            this.snackBar.open('Documento eliminado exitosamente.', '', {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar']
            });
            // Recarga la tabla para reflejar el cambio
            this.loadDocumentos();
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error al eliminar el documento:', err);
            this.snackBar.open('Error al eliminar el documento.', 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'center',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}
