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
    private documentService: DocumentService, // <--- Este servicio es clave
    private dialog: MatDialog,
    
    // 1. REVIERTE la inyección de datos a como estaba
    @Inject(MAT_DIALOG_DATA) public data: { 
      isEditMode: boolean; 
      documento?: Documento 
    }
  ){
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
  console.log('onSubmit iniciado.');
  
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

  try {
    // 1. Mapeo para generar el DTO DE ENTRADA del Backend (con IDs)
    const nuevoDocumentoDTO = this.crearDocumentoDTO(); // Llama a la nueva función de mapeo
    
    // 2. Prepara el objeto completo (con nombres) para la previsualización en el Frontend
    const documentoParaPreview = this.crearDocumentoParaPreview(); 

    console.log('Objeto nuevoDocumentoDTO construido (Para Backend):', nuevoDocumentoDTO);

    this.isLoading = true;

    // --- Abrir el Modal de Preview ---
    const previewDialogRef = this.dialog.open(DocumentPreviewComponent, {
      width: '85%', 
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { documento: documentoParaPreview }
    });
    
    // Escuchamos la respuesta del preview
    previewDialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si confirma, enviamos el DTO correcto al Backend
        this.guardarDocumento(nuevoDocumentoDTO);
      } else {
        this.isLoading = false;
      }
    });

  } catch (error) {
    console.error('Error al construir el objeto o abrir el modal:', error);
    this.isLoading = false;
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
 * Contiene la lógica para "guardar" el documento llamando al servicio.
 * @param documentoDTO El DTO listo para ser enviado al Backend.
 */
private guardarDocumento(documentoDTO: any): void {
  this.isLoading = true;
  
  // Llama al servicio, que internamente hace el POST HTTP
  this.documentService.createDocumento(documentoDTO).subscribe({
    next: (respuesta) => {
      this.isLoading = false;
      console.log("Documento creado exitosamente (Respuesta Backend):", respuesta);
      this.dialogRef.close(true); // Cierra el modal con señal de éxito
    },
    error: (err) => {
      this.isLoading = false;
      console.error("Error al crear documento:", err);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  });
}
/**
 * @private
 * Construye el objeto DTO exactamente como lo espera el Backend.
 */
private crearDocumentoDTO(): any {
  const formValue = this.documentForm.value;

  // 1. Extraer IDs de las relaciones ManyToOne (objetos simples)
  const idTipoDocumento = formValue.tipoDocumento?.idTipoDocumento || null;
  const idSector = formValue.sector?.idSector || null;
  const idEstado = formValue.estado?.idEstado || null;

  // 2. Extraer IDs de las colecciones ManyToMany (Palabras Clave y Referencias)
  const idsPalabrasClave = formValue.palabrasClave.map((pc: any) => pc.idPalabraClave);
  const idsReferencias = formValue.referencias.map((ref: any) => ref.idDocumento);
  
  // 3. Simular la estructura de Archivos del Backend (solo el nombre y URL)
  // Nota: El Backend de tu proyecto (Archivo.java) espera una lista de objetos Archivo.
  // Sin embargo, tu DTO (DocumentoDTO.java) no tiene un campo para `archivos`, 
  // ya que la lógica de subida y asociación de archivos suele ser un paso separado en Spring Boot.
  // Por ahora, incluimos un campo simulado para mantener la integridad del objeto en el Frontend.
  const archivosSimulados: any[] = this.archivosParaSubir.map((file, index) => ({
    nombre: file.name,
    url: `/simulado/uploads/${file.name}`
  }));


  return {
    // Campos primitivos
    titulo: formValue.titulo,
    resumen: formValue.resumen,
    numDocumento: formValue.numDocumento,
    // IDs de las relaciones (¡lo que el Backend necesita!)
    idTipoDocumento: idTipoDocumento,
    idSector: idSector,
    idEstado: idEstado,
    // Listas de IDs
    idsPalabrasClave: idsPalabrasClave,
    idsReferencias: idsReferencias,
    // Incluir Archivos Simulados si el Backend los espera.
    // **ADVERTENCIA:** Según DocumentoDTO.java del Backend, este campo NO EXISTE [cite: 2068-2114].
    // Si tu Backend está usando un DTO diferente para la creación, esto debe ajustarse.
    // Por ahora, se incluye para no perder la información de archivos en la simulación local del Frontend:
    archivos: archivosSimulados, // <-- Revisar con el Backend si se necesita realmente
    // La fecha de creación la pone el Backend, pero la usamos para el preview:
    fechaCreacion: formValue.fechaCreacion 
  };
}


/**
 * @private
 * Construye el objeto Documento con todos los objetos completos para la vista de PREVIEW.
 */
private crearDocumentoParaPreview(): Documento {
  const formValue = this.documentForm.value;
  
  const archivosSimulados: Archivo[] = this.archivosParaSubir.map((file, index) => ({
    idArchivo: 100 + index, // ID simulado
    nombre: file.name,
    url: `/simulado/uploads/${file.name}`
  }));

  const referenciasFormateadas: ReferenciaDocumento[] =
    (formValue.referencias || []).map((doc: DocumentoListItem) => ({
      idDocumento: doc.idDocumento,
      numDocumento: doc.numDocumento
    }));
  
  // La estructura de Documento[] debe incluir campos completos para el preview.
  return {
    idDocumento: 0, // ID 0 ya que aún no se guarda
    titulo: formValue.titulo,
    numDocumento: formValue.numDocumento,
    fechaCreacion: formValue.fechaCreacion,
    resumen: formValue.resumen,
    tipoDocumento: formValue.tipoDocumento,
    sector: formValue.sector,
    estado: formValue.estado,
    palabrasClave: formValue.palabrasClave || [],
    archivos: archivosSimulados,
    referencias: referenciasFormateadas,
    referenciadoPor: []
  };
}
}
