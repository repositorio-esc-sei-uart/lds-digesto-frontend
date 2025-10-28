// Importaciones necesarias
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Observable, take } from 'rxjs';

// Interfaces (¡ya las tienes!)
import { TipoDocumento } from '../../../interfaces/type-document-model';
import { Sector } from '../../../interfaces/sector-model';
import { EstadoDocumento } from '../../../interfaces/status-document-model';
import { PalabraClave } from '../../../interfaces/keyword-document-model';
import { Documento, DocumentoListItem, ReferenciaDocumento } from '../../../interfaces/document-model';
import { Archivo } from '../../../interfaces/archive-document-model';

// Servicios para los Comboboxes
import { TypeDocumentService } from '../../../services/type-document-service';
import { SectorService } from '../../../services/sector-service';
import { StatusDocumentService } from '../../../services/status-document-service';
import { KeywordDocumentService } from '../../../services/keyword-document-service';
import { DocumentService } from '../../../services/document-service'; // Para el POST

// Módulos de Angular Material para el HTML
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from "@angular/material/list";
import { DocumentPreviewComponent } from '../document-preview/document-preview';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
],
  templateUrl: './document-form.html',
  styleUrl: './document-form.css'
})
export class DocumentForm implements OnInit {
  documentForm: FormGroup;
  isLoading = false;
  isEditMode: boolean;
  tipos$!: Observable<TipoDocumento[]>;
  sectores$!: Observable<Sector[]>;
  estados$!: Observable<EstadoDocumento[]>;
  palabrasClave$!: Observable<PalabraClave[]>;
  todosLosDocumentos$!: Observable<DocumentoListItem[]>;
  archivosParaSubir: File[] = [];
  @ViewChild('submitButton', { read: ElementRef }) submitButton!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentForm>,
    private typeDocumentService: TypeDocumentService,
    private sectorService: SectorService,
    private statusDocumentService: StatusDocumentService,
    private keywordDocumentService: KeywordDocumentService,
    private documentService: DocumentService,
    private dialog: MatDialog,
    // Inyectamos los datos pasados al diálogo
    @Inject(MAT_DIALOG_DATA) public data: { isEditMode: boolean; documento?: Documento }
  ) {
    this.isEditMode = data.isEditMode;
    // Definición del Formulario Reactivo
    this.documentForm = this.fb.group({
      // Usamos los nombres de la interfaz Documento
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      numDocumento: ['', [Validators.required, Validators.maxLength(100)]],
      fechaCreacion: [new Date(), Validators.required],
      resumen: ['', Validators.required],
      tipoDocumento: [null, Validators.required],
      sector: [null, Validators.required],
      estado: [null, Validators.required],
      palabrasClave: [[]], // Para el 'mat-chip-list'
      // 'archivos' y 'referencias' se manejarían por separado,
      // quizás en un segundo paso o con un componente de subida.
      referencias: [[]],
    });
  }

  // En ngOnInit, cargamos los datos de los servicios
  ngOnInit(): void {
    this.tipos$ = this.typeDocumentService.getTiposDocumento();
    this.sectores$ = this.sectorService.getSectores();
    this.estados$ = this.statusDocumentService.getEstados();
    this.palabrasClave$ = this.keywordDocumentService.getKeywords();
    this.todosLosDocumentos$ = this.documentService.getDocumentos();
  }

  /** Se ejecuta cuando el usuario selecciona archivos en el input */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      // Usamos 'concat' para añadir a la lista en vez de reemplazarla
      this.archivosParaSubir = this.archivosParaSubir.concat(Array.from(input.files));
    }
    // Reseteamos el input para permitir seleccionar el mismo archivo de nuevo si se borra
    input.value = '';
  }

  removerArchivo(archivoARemover: File): void {
  // Filtramos el arreglo, creando uno nuevo que no incluya el archivo a remover
  this.archivosParaSubir = this.archivosParaSubir.filter(
    (file) => file !== archivoARemover
  );
  }

  // Lógica de envío
  onSubmit(): void {
    // datos simulados
    console.log('onSubmit iniciado.');
    // Validaciones
    if (this.documentForm.invalid) {
      console.error('Formulario inválido:', this.documentForm.errors);
      this.documentForm.markAllAsTouched();
      return;
    }
    if (this.archivosParaSubir.length === 0 && !this.isEditMode) {
      console.error("Debe subir al menos un archivo");
      return;
    }

    console.log('Validaciones pasadas.');

    this.isLoading = true;

    try {
      // Construcción del objeto
      const archivosSimulados: Archivo[] = this.archivosParaSubir.map((file, index) => ({
        idArchivo: 100 + index,
        nombre: file.name,
        url: `/simulado/uploads/${file.name}`
      }));

      const referenciasFormateadas: ReferenciaDocumento[] =
        (this.documentForm.value.referencias || []).map((doc: DocumentoListItem) => ({
          idDocumento: doc.idDocumento,
          numDocumento: doc.numDocumento
        }));

      const nuevoDocumento: Documento = {
        idDocumento: 0,
        titulo: this.documentForm.value.titulo,
        numDocumento: this.documentForm.value.numDocumento,
        fechaCreacion: this.documentForm.value.fechaCreacion,
        resumen: this.documentForm.value.resumen,
        tipoDocumento: this.documentForm.value.tipoDocumento,
        sector: this.documentForm.value.sector,
        estado: this.documentForm.value.estado,
        palabrasClave: this.documentForm.value.palabrasClave || [],
        archivos: archivosSimulados,
        referencias: referenciasFormateadas,
        referenciadoPor: []
      };

      console.log('Objeto nuevoDocumento construido:', nuevoDocumento);

      // --- Abrir el Modal de Preview ---
      console.log('Intentando abrir modal de previsualización...');
      const previewDialogRef = this.dialog.open(DocumentPreviewComponent, {
        width: '85%', // Ajusta el ancho como prefieras
        maxWidth: '1200px',
        maxHeight: '90vh',
        data: { documento: nuevoDocumento }
      });
      console.log('Modal de previsualización abierto (o debería).'); // <-- LOG 6


      // Escuchamos la respuesta del preview
      previewDialogRef.afterClosed().subscribe(result => {
        console.log('Modal de previsualización cerrado con resultado:', result); // <-- LOG 7

        if (result === true) {
          // Si confirma, llamamos a guardar (que maneja su propio isLoading)
          this.guardarDocumento(nuevoDocumento);
        } else {
          // Si cancela la previsualización, quitamos el loader
          this.isLoading = false;
          this.submitButton.nativeElement.blur();
        }
      });

    } catch (error) {
        console.error('Error durante la construcción del objeto o apertura del modal:', error); // <-- LOG DE ERROR
        this.isLoading = false; // Quitar loader si falla antes de abrir preview
    }
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cierra el modal sin hacer nada
  }

  /**
   * Selecciona o deselecciona todas las palabras clave.
   */
  toggleAllSelection(isSelected: boolean) {
    if (isSelected) {
      // Si se marcó "Seleccionar Todos", tomamos la lista completa
      // de palabras clave y la asignamos al formulario.
      this.palabrasClave$.pipe(take(1)).subscribe(keywords => {
        this.documentForm.get('palabrasClave')?.setValue(keywords);
      });
    } else {
      // Si se desmarcó, asignamos un array vacío.
      this.documentForm.get('palabrasClave')?.setValue([]);
    }
  }

  /**
   * Contiene la lógica para "guardar" el documento (simulado).
   * Se llama después de que el usuario confirma en la previsualización.
   */
  private guardarDocumento(documento: Documento): void {

    // datos similados
    this.isLoading = true;

    console.log("Enviando (simulado):", documento);

    this.documentService.createDocumento(documento).subscribe({
      next: (respuesta) => {
        this.isLoading = false;
        console.log("Respuesta (simulada):", respuesta);
        // Cierra el MODAL DEL FORMULARIO ORIGINAL
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error al crear documento:", err);
      }
    });
  }
}
