import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  

  constructor(private documentService: DocumentService,private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadDocumentos();
  }

  loadDocumentos(): void {
    this.isLoading = true;
    this.documentService.getDocumentos().subscribe({
      next: (data) => {
        this.dataSource = data;
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
          horizontalPosition: 'left', // A la izquierda
          panelClass: ['success-snackbar']
        });
        console.log('Documento creado, refrescando la tabla...');
        this.loadDocumentos(); // se recargan los datos!
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
    } else if (status=== 'derogado parcial') {
      return 'status-derogado-parcial';
    } else if (status === 'derogado total') {
      return 'status-derogado-total';
    }
    return 'status-otro';
  }

  /**
   * Abre un diálogo modal para previsualizar el detalle de un documento.
   * @param documentoId El ID del documento a previsualizar.
   */
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

  // Lógica para el filtro de la tabla
  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();
    // NOTA: La lógica de filtro se implementará cuando se conecte a MatPaginator y MatSort
    console.log("Filtrando...", (event.target as HTMLInputElement).value);
  }

  onDelete(docId: number, docNum: string): void {
    // Lógica para el modal de confirmación
    console.warn(`(WIP) Se solicitó eliminar el documento ID: ${docId} (${docNum})`);
  }
}
