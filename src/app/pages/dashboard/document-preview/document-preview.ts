import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Importa CommonModule y DatePipe
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Documento } from '../../../interfaces/document-model';

// Módulos de Material para la vista
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  // 1. Añade los módulos que el HTML usará
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './document-preview.html',
  styleUrl: './document-preview.css'
})
export class DocumentPreviewComponent {

  // 2. Propiedad para guardar el documento
  documento: Documento;

  constructor(
    public dialogRef: MatDialogRef<DocumentPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { documento: Documento }
  ) {
    // 3. Asigna los datos recibidos
    this.documento = data.documento;
  }

  // 4. Botón para volver al formulario
  onCancel(): void {
    this.dialogRef.close(false); // Devuelve 'false'
  }

  // 5. Botón para confirmar
  onConfirm(): void {
    this.dialogRef.close(true); // Devuelve 'true'
  }
}
