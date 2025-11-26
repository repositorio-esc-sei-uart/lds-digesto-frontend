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
      numDocumento: ['', [Validators.required, Validators.min(1)]],
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

  ngOnInit(): void {
    // Catálogos básicos
    this.tipos$ = this.typeDocumentService.getTiposDocumento();
    this.sectores$ = this.sectorService.getSectores();
    this.unidades$ = this.unidadEjecutoraService.getUnidadesEjecutoras();
    this.estados$ = this.statusDocumentService.getEstados();
    this.palabrasClave$ = this.keywordDocumentService.getKeywords();
    this.todosLosDocumentos$ = this.documentService.getDocumentos(
        0, 
        1000, 
        undefined, 
        undefined, 
        undefined, 
        true).pipe(
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
      // Contenedores para los errores
      const rechazadosPorTamano: string[] = [];
      let cantidadRechazadosPorTipo = 0;

      const MAX_SIZE_MB = 10;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      for (const archivo of archivos) {
        // 1. Validar que sea PDF (Si falla, solo sumamos al contador)
        if (!archivo.name.toLowerCase().endsWith('.pdf')) {
          cantidadRechazadosPorTipo++;
          continue; 
        }

        // 2. Validar Tamaño (Si falla, guardamos el nombre específico)
        if (archivo.size > MAX_SIZE_BYTES) {
          rechazadosPorTamano.push(archivo.name);
          continue; 
        }

        // Si pasa ambas, es válido
        archivosPDF.push(archivo);
      }
      this.archivosParaSubir = this.archivosParaSubir.concat(archivosPDF);

      // --- Construcción del Mensaje Inteligente ---
      const lineasMensaje: string[] = [];

      // A. Listar nombres de los archivos muy pesados
      if (rechazadosPorTamano.length > 0) {
        rechazadosPorTamano.forEach(nombre => {
          lineasMensaje.push(`• "${nombre}" excede el límite de ${MAX_SIZE_MB}MB.`);
        });
      }

      // B. Mostrar resumen numérico de los que no eran PDF
      if (cantidadRechazadosPorTipo > 0) {
        const plural = cantidadRechazadosPorTipo > 1;
        lineasMensaje.push(`• Se ignoraron ${cantidadRechazadosPorTipo} archivo${plural ? 's' : ''} porque no ${plural ? 'eran' : 'era'} PDF.`);
      }

      // C. Mostrar SnackBar si hubo algún rechazo
      if (lineasMensaje.length > 0) {
        const mensajeFinal = `No se pudieron cargar algunos archivos:\n${lineasMensaje.join('\n')}`;
        
        this.snackBar.open(mensajeFinal, 'Cerrar', {
          duration: 8000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          // Agregamos 'multi-line-snackbar' para permitir saltos de línea
          panelClass: ['error-snackbar', 'multi-line-snackbar'] 
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
      numDocumento: this.generarNomenclatura(),
      idTipoDocumento: idTipoDocumento,
      idSector: idSector,
      idUnidadEjecutora: idUnidadEjecutora,
      idEstado: idEstado,
      idsPalabrasClave: idsPalabrasClave,
      idsReferencias: idsReferencias,
      fechaCreacion: formValue.fechaCreacion
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
      numDocumento: this.generarNomenclatura(),
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

    // LÓGICA NUEVA PARA EXTRAER EL NÚMERO
    let numeroExtraido = '';
    if (documento.numDocumento) {
      const partes = documento.numDocumento.split('-');
      // Asumimos que el número siempre está en la posición 1 (Índice 1)
      // Ej: R [0] - 001 [1] - 25 [2] ...
      if (partes.length > 1) {
        // parseInt convierte "001" en 1 para que el input type="number" lo lea bien
        const numero = parseInt(partes[1], 10);
        numeroExtraido = isNaN(numero) ? '' : numero.toString();
      }
    }
    this.documentForm.patchValue({
    titulo: documento.titulo,
    numDocumento: numeroExtraido,
    fechaCreacion: documento.fechaCreacion,
    resumen: documento.resumen,
    
    // Asignación directa (el compareObjects corregido hará el trabajo de emparejarlo con el select)
    tipoDocumento: documento.tipoDocumento,
    sector: documento.sector,
    estado: documento.estado,
    unidadEjecutora: documento.unidadEjecutora,
    
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
  private generarNomenclatura(): string {
    const formValue = this.documentForm.value;

    // 1. Validaciones básicas para evitar errores si el form está incompleto
    if (!formValue.tipoDocumento || !formValue.unidadEjecutora || !formValue.fechaCreacion) {
      return ''; // O un string temporal como "---"
    }

    // 2. Obtener datos
    const tipoDoc = formValue.tipoDocumento;
    const sector = formValue.sector;
    const unidadEjecutora = formValue.unidadEjecutora;

    // 3. Formatear Año
    const fecha = new Date(formValue.fechaCreacion);
    const añoShort = fecha.getFullYear().toString().slice(-2);

    // 4. Formatear Número
    const numeroRaw = formValue.numDocumento || 0;
    const numeroFormateado = numeroRaw.toString().padStart(3, '0');

    // 5. Nomenclaturas
    const prefijoTipo = tipoDoc.nomenclatura || tipoDoc.nombre.charAt(0).toUpperCase();
    const sufijoUnidad = unidadEjecutora.nomenclatura || 'UNPA';

    // Lógica de Sector Opcional
    const codigoSector = sector?.nomenclatura ? sector.nomenclatura : null;

    // 6. Armar Array y Unir
    return [
      prefijoTipo,
      numeroFormateado,
      añoShort,
      codigoSector, // Si es null, se ignora
      sufijoUnidad
    ].filter(Boolean).join('-');
  }
  // Función para comparar objetos en los Selects
  compareObjects(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
    return o1 === o2;
  }

  // 2. Verificamos qué tipo de objeto es mirando si tiene la propiedad ID correspondiente
  // Usamos el operador 'in' para asegurar que la propiedad existe en ambos objetos
  if ('idTipoDocumento' in o1 && 'idTipoDocumento' in o2) {
    return o1.idTipoDocumento === o2.idTipoDocumento;
  }
  
  if ('idSector' in o1 && 'idSector' in o2) {
    return o1.idSector === o2.idSector;
  }
  
  if ('idUnidadEjecutora' in o1 && 'idUnidadEjecutora' in o2) {
    return o1.idUnidadEjecutora === o2.idUnidadEjecutora;
  }
  
  if ('idEstado' in o1 && 'idEstado' in o2) {
    return o1.idEstado === o2.idEstado;
  }

  // 3. Fallback: comparación por referencia si no coincide con ninguno anterior
  return o1 === o2;
  }
}