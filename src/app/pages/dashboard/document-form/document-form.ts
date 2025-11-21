import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, of, switchMap, take, map, startWith } from 'rxjs';

import { TipoDocumento } from '../../../interfaces/type-document-model';
import { Sector } from '../../../interfaces/sector-model';
import { EstadoDocumento } from '../../../interfaces/status-document-model';
import { PalabraClave } from '../../../interfaces/keyword-document-model';
import { Documento, DocumentoListItem, ReferenciaDocumento } from '../../../interfaces/document-model';
import { Archivo } from '../../../interfaces/archive-document-model';
import { UnidadEjecutora } from '../../../interfaces/unidad-ejecutora-model';

// Servicios para los Comboboxes
import { TypeDocumentService } from '../../../services/type-document-service';
import { SectorService } from '../../../services/sector-service';
import { StatusDocumentService } from '../../../services/status-document-service';
import { KeywordDocumentService } from '../../../services/keyword-document-service';
import { DocumentService } from '../../../services/document-service'; 
import { UnidadEjecutoraService } from '../../../services/unidad-ejecutora-service';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  templateUrl: './document-form.html',
  styleUrl: './document-form.css'
})

/**
 * @class DocumentForm
 * Componente modal (dialog) para crear o editar un Documento.
 */
export class DocumentForm implements OnInit {
  documentForm: FormGroup;
  isLoading = false;
  isEditMode: boolean;
  tipos$!: Observable<TipoDocumento[]>;
  sectores$!: Observable<Sector[]>;
  estados$!: Observable<EstadoDocumento[]>;
  palabrasClave$!: Observable<PalabraClave[]>;
  todosLosDocumentos$!: Observable<DocumentoListItem[]>;
  unidades$!: Observable<UnidadEjecutora[]>;
  archivosExistentes: Archivo[] = [];
  // Referencias
  referenciasSeleccionadas: DocumentoListItem[] = [];
  referenciaCtrl = new FormControl();
  filteredDocs$!: Observable<DocumentoListItem[]>;
  searchText = '';  
  @ViewChild('referenciaInput') referenciaInput!: ElementRef<HTMLInputElement>;

  // Palabras Clave
  palabrasClaveSeleccionadas: PalabraClave[] = [];
  palabraClaveCtrl = new FormControl();
  palabrasClaveDisponibles: PalabraClave[] = [];
  palabrasClaveFiltradas$!: Observable<PalabraClave[]>;
  @ViewChild('palabraClaveInput') palabraClaveInput!: ElementRef<HTMLInputElement>;

  private politicaDeNombreado: 'original' | 'titulo' | 'numDocumento' = 'original'; 
  archivosParaSubir: File[] = [];

  @ViewChild('submitButton', { read: ElementRef }) submitButton!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentForm>,
    private typeDocumentService: TypeDocumentService,
    private sectorService: SectorService,
    private unidadEjecutoraService: UnidadEjecutoraService,
    private statusDocumentService: StatusDocumentService,
    private keywordDocumentService: KeywordDocumentService,
    private documentService: DocumentService, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar, 
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditMode: boolean;
      documento?: Documento
    }
  ) {
    this.isEditMode = data.isEditMode;
    this.documentForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      numDocumento: ['', [Validators.required, Validators.maxLength(100)]],
      fechaCreacion: [new Date(), Validators.required],
      resumen: ['', Validators.required],
      tipoDocumento: [null, Validators.required],
      sector: [null, Validators.required],
      unidadEjecutora: [null, Validators.required],
      estado: [null, Validators.required],
      palabrasClave: [[]], 
      referencias: [[]],
    });
  }

  private toISODateString(date: any): string {
    if (!date) {
      const today = new Date();
      const adjustedToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      return adjustedToday.toISOString().split('T')[0];
    }
    const validDate = new Date(date);
    const year = validDate.getFullYear();
    const month = validDate.getMonth() + 1; 
    const day = validDate.getDate();
    const monthFormatted = month < 10 ? '0' + month : month;
    const dayFormatted = day < 10 ? '0' + day : day;

    return `${year}-${monthFormatted}-${dayFormatted}`;
  }

  ngOnInit(): void {
    // Catálogos básicos
    this.tipos$ = this.typeDocumentService.getTiposDocumento();
    this.sectores$ = this.sectorService.getSectores();
    this.unidades$ = this.unidadEjecutoraService.getUnidadesEjecutoras();
    this.estados$ = this.statusDocumentService.getEstados();
    this.palabrasClave$ = this.keywordDocumentService.getKeywords();
    this.todosLosDocumentos$ = this.documentService.getDocumentos().pipe(
      map(response => response.content)
    );

    this.todosLosDocumentos$.pipe(take(1)).subscribe(docs => {
      this.filteredDocs$ = this.referenciaCtrl.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.titulo),
        map(titulo => titulo ? this._filter(docs, titulo) : docs)
      );
    });

    this.keywordDocumentService.getKeywords().pipe(take(1)).subscribe(palabras => {
      this.palabrasClaveDisponibles = palabras; 
      this.palabrasClaveFiltradas$ = this.palabraClaveCtrl.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.nombre),
        map(texto => this.filtrarPalabrasClave(texto || ''))
      );
    });

    if (this.data.documento && this.data.documento.archivos) {
        this.archivosExistentes = [...this.data.documento.archivos];
    }
    if (this.isEditMode && this.data.documento) {
      forkJoin({
        tipos: this.tipos$.pipe(take(1)),
        sectores: this.sectores$.pipe(take(1)),
        unidades: this.unidades$.pipe(take(1)),
        estados: this.estados$.pipe(take(1)),
        palabras: this.palabrasClave$.pipe(take(1)),
        documentos: this.todosLosDocumentos$.pipe(take(1)) 
      }).subscribe((catalogos) => {
        this.fillFormForEdit(this.data.documento!, catalogos);
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const archivos = Array.from(input.files);
      const archivosPDF: File[] = [];
      const archivosRechazados: string[] = [];

      for (const archivo of archivos) {
        if (archivo.name.toLowerCase().endsWith('.pdf')) {
          archivosPDF.push(archivo);
        } else {
          archivosRechazados.push(archivo.name);
        }
      }
      this.archivosParaSubir = this.archivosParaSubir.concat(archivosPDF);

      if (archivosRechazados.length > 0) {
        const mensaje = `Se ignoraron ${archivosRechazados.length} archivos. Solo se permiten PDFs.`;
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          verticalPosition: 'top', 
          horizontalPosition: 'center',
          panelClass: ['error-snackbar'] 
        });
      }
    }
    input.value = '';
  }

  removerArchivo(archivoARemover: File): void {
    this.archivosParaSubir = this.archivosParaSubir.filter(
      (file) => file !== archivoARemover
    );
  }

  onSubmit(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }
    if (this.archivosParaSubir.length === 0 && !this.isEditMode) {
      this.snackBar.open('Debe adjuntar al menos un archivo PDF.', 'Cerrar', {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      const archivosFinales = this.archivosParaSubir;
      const nuevoDocumentoDTO = this.crearDocumentoDTO();
      const documentoParaPreview = this.crearDocumentoParaPreview();

      this.isLoading = true;
      if (this.isEditMode) {
        this.guardarDocumento(nuevoDocumentoDTO, archivosFinales);
      } else {
        const previewDialogRef = this.dialog.open(DocumentPreviewComponent, {
          width: '95%',
          maxWidth: '98vw',
          maxHeight: '90vh',
          data: { documento: documentoParaPreview }
        });
        previewDialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.guardarDocumento(nuevoDocumentoDTO, archivosFinales);
          } else {
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    if(this.isEditMode)
    this.dialogRef.close(false); 
  }

  toggleAllSelection(isSelected: boolean) {
    if (isSelected) {
      this.palabrasClave$.pipe(take(1)).subscribe(keywords => {
        this.documentForm.get('palabrasClave')?.setValue(keywords);
      });
    } else {
      this.documentForm.get('palabrasClave')?.setValue([]);
    }
  }

  private guardarDocumento(documentoDTO: any, archivosParaSubir: File[]): void {
    this.isLoading = true;
    const saveOperation$ = this.isEditMode
      ? this.documentService.updateDocumento(this.data.documento!.idDocumento, documentoDTO)
      : this.documentService.createDocumento(documentoDTO);

    saveOperation$.pipe(
      switchMap((respuestaDTO: any) => {
        const idDocumentoProcesado = this.isEditMode
          ? this.data.documento!.idDocumento
          : respuestaDTO.idDocumento;
        
        if (archivosParaSubir.length === 0) {
          return of({ success: true, message: 'Documento guardado sin archivos nuevos.' });
        }

        switch (this.politicaDeNombreado) {
          case 'titulo':
          case 'numDocumento':
          case 'original':
          default:
            return this.documentService.subirArchivos(idDocumentoProcesado, archivosParaSubir);
        }
      })
    ).subscribe({
      next: (respuestaSubida) => {
        this.isLoading = false;
        this.dialogRef.close(true); 
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        let mensajeError = 'Ocurrió un error inesperado al guardar.';
        if (err.status === 409 && err.error?.message) {
          mensajeError = err.error.message;
        }
        this.snackBar.open(mensajeError, 'Cerrar', {
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private crearDocumentoDTO(): any {
    const formValue = this.documentForm.value;
    const idTipoDocumento = formValue.tipoDocumento?.idTipoDocumento || null;
    const idSector = formValue.sector?.idSector || null;
    const idEstado = formValue.estado?.idEstado || null;
    const idUnidadEjecutora = formValue.unidadEjecutora?.idUnidadEjecutora || null;
    const idsPalabrasClave = formValue.palabrasClave.map((pc: any) => pc.idPalabraClave);
    const idsReferencias = formValue.referencias.map((ref: any) => ref.idDocumento);

    return {
      titulo: formValue.titulo,
      resumen: formValue.resumen,
      numDocumento: formValue.numDocumento,
      idTipoDocumento: idTipoDocumento,
      idSector: idSector,
      idUnidadEjecutora: idUnidadEjecutora,
      idEstado: idEstado,
      idsPalabrasClave: idsPalabrasClave,
      idsReferencias: idsReferencias,
      fechaCreacion: this.toISODateString(formValue.fechaCreacion)
  };
  };

  private crearDocumentoParaPreview(): Documento {
    const formValue = this.documentForm.value;

    const archivosSimulados: Archivo[] = this.archivosParaSubir.map((file, index) => ({
      idArchivo: 100 + index, 
      nombre: file.name,
      url: `/simulado/uploads/${file.name}`
    }));

    const referenciasFormateadas: ReferenciaDocumento[] =
      (formValue.referencias || []).map((doc: DocumentoListItem) => ({
        idDocumento: doc.idDocumento,
        numDocumento: doc.numDocumento
      }));

    return {
      idDocumento: 0, 
      titulo: formValue.titulo,
      numDocumento: formValue.numDocumento,
      fechaCreacion: formValue.fechaCreacion,
      resumen: formValue.resumen,
      tipoDocumento: formValue.tipoDocumento,
      sector: formValue.sector,
      unidadEjecutora: formValue.unidadEjecutora,
      activo: true,
      estado: formValue.estado,
      palabrasClave: formValue.palabrasClave || [],
      archivos: archivosSimulados,
      referencias: referenciasFormateadas,
      referenciadoPor: []
    };
  }

  private fillFormForEdit(documento: Documento, catalogos: any): void {
    const tipoDocCorrecto = catalogos.tipos.find(
      (t: TipoDocumento) => t.idTipoDocumento === documento.tipoDocumento.idTipoDocumento
    );
    const sectorCorrecto = catalogos.sectores.find(
      (s: Sector) => s.idSector === documento.sector.idSector
    );
    const estadoCorrecto = catalogos.estados.find(
      (e: EstadoDocumento) => e.idEstado === documento.estado.idEstado
    );
    const unidadCorrecta = catalogos.unidades.find(
      (u: UnidadEjecutora) => u.idUnidadEjecutora === documento.unidadEjecutora.idUnidadEjecutora);

    this.documentForm.patchValue({
      titulo: documento.titulo,
      numDocumento: documento.numDocumento,
      fechaCreacion: documento.fechaCreacion,
      resumen: documento.resumen,
      tipoDocumento: tipoDocCorrecto,
      sector: sectorCorrecto,
      estado: estadoCorrecto,
      unidadEjecutora: unidadCorrecta,
      palabrasClave: documento.palabrasClave,
      referencias: documento.referencias
    });
  }
  removerArchivoExistente(archivoARemover: Archivo): void {
    this.isLoading = true; 
    this.documentService.deleteArchivo(archivoARemover.idArchivo).subscribe({
      next: () => {
        this.isLoading = false;
        this.archivosExistentes = this.archivosExistentes.filter(
          (a) => a.idArchivo !== archivoARemover.idArchivo
        );
        this.snackBar.open('Archivo eliminado permanentemente.', 'Cerrar', {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error al eliminar el archivo.', 'Cerrar', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private _filter(docs: DocumentoListItem[], value: string): DocumentoListItem[] {
    const filterValue = value.toLowerCase();
    return docs.filter(doc =>
      doc.titulo.toLowerCase().includes(filterValue) ||
      doc.numDocumento.toLowerCase().includes(filterValue)
    );
  }

  addReferencia(doc: DocumentoListItem): void {
    if (!this.referenciasSeleccionadas.find(r => r.idDocumento === doc.idDocumento)) {
      this.referenciasSeleccionadas.push(doc);
    }
    if (this.referenciaInput) {
      this.referenciaInput.nativeElement.value = '';
    }
    this.referenciaCtrl.setValue('');
    this.documentForm.get('referencias')?.setValue(this.referenciasSeleccionadas);
  }

  removeReferencia(doc: DocumentoListItem): void {
    const index = this.referenciasSeleccionadas.indexOf(doc);
    if (index >= 0) {
      this.referenciasSeleccionadas.splice(index, 1);
    }
    this.documentForm.get('referencias')?.setValue(this.referenciasSeleccionadas);
  }

  filtrarPalabrasClave(texto: string): PalabraClave[] {
    const filtro = (texto || '').toLowerCase();
    return this.palabrasClaveDisponibles.filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
  }

  addPalabraClave(palabra: PalabraClave): void {
    if (!this.palabrasClaveSeleccionadas.some(p => p.idPalabraClave === palabra.idPalabraClave)) {
      this.palabrasClaveSeleccionadas.push(palabra);
    }
    if (this.palabraClaveInput) {
      this.palabraClaveInput.nativeElement.value = '';
    }
    this.palabraClaveCtrl.setValue('');
    this.documentForm.get('palabrasClave')?.setValue(this.palabrasClaveSeleccionadas);
  }

  removePalabraClave(palabra: PalabraClave): void {
    const index = this.palabrasClaveSeleccionadas.indexOf(palabra);
    if (index >= 0) {
      this.palabrasClaveSeleccionadas.splice(index, 1);
    }
    this.documentForm.get('palabrasClave')?.setValue(this.palabrasClaveSeleccionadas);
  }
}