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
 * Carga los catálogos (Tipos, Sectores, etc.) y gestiona la validación
 * y el envío del formulario.
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

  // 🔑 NUEVO: lista local y control para referencias
  referenciasSeleccionadas: DocumentoListItem[] = [];
  referenciaCtrl = new FormControl();
  filteredDocs$!: Observable<DocumentoListItem[]>;
  searchText = '';  // texto del buscador
  @ViewChild('referenciaInput') referenciaInput!: ElementRef<HTMLInputElement>;


  // Lista seleccionada
  palabrasClaveSeleccionadas: PalabraClave[] = [];

  // FormControl
  palabraClaveCtrl = new FormControl();

  // Array con todas las palabras disponibles
  palabrasClaveDisponibles: PalabraClave[] = [];

  // Observable filtrado
  palabrasClaveFiltradas$!: Observable<PalabraClave[]>;

  // Para limpiar el input real
  @ViewChild('palabraClaveInput') palabraClaveInput!: ElementRef<HTMLInputElement>;


  /**
   * Define la política de nombrado de archivos que usará el backend.
   * 'original': El backend usará el nombre original del archivo. (Default actual)
   * 'titulo': (Futuro) El frontend llamará al endpoint /subirPorTitulo
   * 'numDocumento': (Futuro) El frontend llamará al endpoint /subirPorNumDoc
   */
  private politicaDeNombreado: 'original' | 'titulo' | 'numDocumento' = 'original'; // <-- PARÁMETRO

  /** Almacena la lista de archivos seleccionados por el usuario. */
  archivosParaSubir: File[] = [];

  @ViewChild('submitButton', { read: ElementRef }) submitButton!: ElementRef;

  /**
   * @constructor
   * Inyecta los servicios necesarios y construye el formulario reactivo.
   * @param data Datos inyectados al modal (ej. `isEditMode`).
   */
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DocumentForm>,
    private typeDocumentService: TypeDocumentService,
    private sectorService: SectorService,
    private statusDocumentService: StatusDocumentService,
    private keywordDocumentService: KeywordDocumentService,
    private documentService: DocumentService, // <--- Este servicio es clave
    private dialog: MatDialog,
    private snackBar: MatSnackBar, // <--- barra de notificacion

    // 1. REVIERTE la inyección de datos a como estaba
    @Inject(MAT_DIALOG_DATA) public data: {
      isEditMode: boolean;
      documento?: Documento
    }
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

  /**
  * Convierte un objeto Date de JS a un string YYYY-MM-DD local.
  * @param date El objeto Date del formulario.
  * @returns Un string en formato YYYY-MM-DD.
  */
 /**
  * Convierte un valor (Date, string, o null) a un string YYYY-MM-DD local.
  * @param date El valor del formulario.
  * @returns Un string en formato YYYY-MM-DD.
  */
  private toISODateString(date: any): string {
    if (!date) {
      // Si la fecha es nula, devuelve la fecha de hoy como string
      const today = new Date();
      const adjustedToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
      return adjustedToday.toISOString().split('T')[0];
    }

    // 1. Crear un objeto Date válido sin importar la entrada (si es string o Date)
    const validDate = new Date(date);

    // 2. Extraer el año, mes y día LOCALES (como los ve el usuario)
    const year = validDate.getFullYear();
    const month = validDate.getMonth() + 1; // getMonth() es base 0 (0 = Enero)
    const day = validDate.getDate();

    // 3. Formatear a YYYY-MM-DD
    const monthFormatted = month < 10 ? '0' + month : month;
    const dayFormatted = day < 10 ? '0' + day : day;

    return `${year}-${monthFormatted}-${dayFormatted}`;
  }

  /**
   * @LifecycleHook ngOnInit
   * Carga todos los catálogos necesarios para los <mat-select>
   * (Tipos, Sectores, Estados, Palabras Clave y Documentos para referencias).
   */
ngOnInit(): void {
  // Catálogos
  this.tipos$ = this.typeDocumentService.getTiposDocumento();
  this.sectores$ = this.sectorService.getSectores();
  this.estados$ = this.statusDocumentService.getEstados();
  this.palabrasClave$ = this.keywordDocumentService.getKeywords();

  // ---------------------------
  // REFERENCIAS 
  // ---------------------------
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

  // ---------------------------
  // 🔥 PALABRAS CLAVE 
  // ---------------------------

  // Cargamos las palabras y, solo cuando estén, inicializamos el observable del autocomplete
  this.keywordDocumentService.getKeywords().pipe(take(1)).subscribe(palabras => {
    this.palabrasClaveDisponibles = palabras; // lista base

    // Ahora sí inicializamos el observable: al emitir startWith('') ya habrá opciones para renderizar
    this.palabrasClaveFiltradas$ = this.palabraClaveCtrl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.nombre),
      map(texto => this.filtrarPalabrasClave(texto || ''))
    );
    
  });


  // ---------------------------
  // MODO EDICIÓN
  // ---------------------------
  if (this.isEditMode && this.data.documento) {
    forkJoin({
      tipos: this.tipos$.pipe(take(1)),
      sectores: this.sectores$.pipe(take(1)),
      estados: this.estados$.pipe(take(1)),
      palabras: this.palabrasClave$.pipe(take(1)),
      documentos: this.todosLosDocumentos$.pipe(take(1))
    }).subscribe((catalogos) => {
      this.fillFormForEdit(this.data.documento!, catalogos);
    });
  }
}


  /**
   * Se dispara cuando el usuario selecciona archivos desde el input <file>.
   * Añade los archivos seleccionados a la lista `archivosParaSubir`.
   * @param event El evento 'change' del input.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const archivos = Array.from(input.files);

      const archivosPDF: File[] = [];
      const archivosRechazados: string[] = [];

      // 1. Separar los PDFs de los no-PDFs
      for (const archivo of archivos) {
        // Validamos por la extensión del nombre (más seguro que el MIME type)
        if (archivo.name.toLowerCase().endsWith('.pdf')) {
          archivosPDF.push(archivo);
        } else {
          archivosRechazados.push(archivo.name);
        }
      }

      // 2. Añadir solo los PDFs válidos a la lista
      this.archivosParaSubir = this.archivosParaSubir.concat(archivosPDF);

      // 3. Notificar al usuario si se rechazaron archivos
      if (archivosRechazados.length > 0) {
        const mensaje = `Se ignoraron ${archivosRechazados.length} archivos. Solo se permiten PDFs.`;

        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 5000,
          verticalPosition: 'top', // Posición ARRIBA (dentro del modal)
          horizontalPosition: 'center',
          panelClass: ['error-snackbar'] // Reutilizamos el estilo de error
        });

        console.warn('Archivos rechazados (no PDF):', archivosRechazados);
      }
    }
    // Reseteamos el input
    input.value = '';
  }


  /**
   * Elimina un archivo de la lista `archivosParaSubir`
   * @param archivoARemover El objeto File que se debe quitar.
   */
  removerArchivo(archivoARemover: File): void {
    // Filtramos el arreglo, creando uno nuevo que no incluya el archivo a remover
    this.archivosParaSubir = this.archivosParaSubir.filter(
      (file) => file !== archivoARemover
    );
  }

  /**
   * Se ejecuta al enviar el formulario (clic en "Vista Documento").
   * Valida, construye el DTO para el backend y el objeto para la preview,
   * y abre el modal de previsualización (`DocumentPreviewComponent`).
   */
  /**
   * Se ejecuta al enviar el formulario (clic en "Vista Documento").
   * Valida, construye el DTO para el backend y el objeto para la preview,
   * y abre el modal de previsualización (`DocumentPreviewComponent`).
   */
  onSubmit(): void {
    console.log('onSubmit iniciado.');

    // --- Validaciones documento ---
    if (this.documentForm.invalid) {
      console.error('Formulario inválido:', this.documentForm.errors);
      this.documentForm.markAllAsTouched();
      return;
    }
    // (Validación de PDF)
    if (this.archivosParaSubir.length === 0 && !this.isEditMode) {
      console.error("Debe subir al menos un archivo (solo PDF)");
      this.snackBar.open('Debe adjuntar al menos un archivo PDF.', 'Cerrar', {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['error-snackbar']
      });
      return;
    }
    console.log('Validaciones pasadas.');

    try {
      // 1. Obtiene los archivos a subir (ya filtrados por PDF)
      const archivosFinales = this.archivosParaSubir;

      // 2. Mapeo para generar el DTO (usa this.archivosParaSubir internamente)
      const nuevoDocumentoDTO = this.crearDocumentoDTO();

      // 3. Prepara el objeto para la PREVISUALIZACIÓN (usa this.archivosParaSubir internamente)
      const documentoParaPreview = this.crearDocumentoParaPreview();

      this.isLoading = true;
      // --- INICIO DE LA MODIFICACIÓN ---
      // Añadimos este log para depurar el objeto exacto que se envía
      console.log('--- PAYLOAD FINAL ENVIADO AL BACKEND ---');
      console.log(JSON.stringify(nuevoDocumentoDTO, null, 2));
      // --- FIN DE LA MODIFICACIÓN ---

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
          // Si confirma, enviamos el DTO y los ARCHIVOS FINALES
          this.guardarDocumento(nuevoDocumentoDTO, archivosFinales);
        } else {
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Error al construir el objeto o abrir el modal:', error);
      this.isLoading = false;
    }
  }
  /**
   * Cierra el diálogo modal sin guardar, devolviendo 'false'.
   */
  onCancel(): void {
    this.dialogRef.close(false); // Cierra el modal sin hacer nada
  }

  /**
   * Selecciona o deselecciona todas las opciones del <mat-select>
   * de Palabras Clave.
   * @param isSelected El estado del checkbox "Seleccionar Todos".
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
     * Encadena las llamadas y selecciona el endpoint de subida de archivos
     * basado en el parámetro 'politicaDeNombreado'.
     * @param documentoDTO El DTO listo para ser enviado al Backend.
     * @param archivosParaSubir La lista de archivos (ya filtrados por PDF) a subir.
     */
  private guardarDocumento(documentoDTO: any, archivosParaSubir: File[]): void {
    this.isLoading = true;

    // Determinar si estamos CREANDO o ACTUALIZANDO
    const saveOperation$ = this.isEditMode
      ? this.documentService.updateDocumento(this.data.documento!.idDocumento, documentoDTO)
      : this.documentService.createDocumento(documentoDTO);

    // Guardar los metadatos (POST o PUT)
    saveOperation$.pipe(

      // Encadenar la subida de archivos según la política
      // Nota: La subida de archivos es independiente de si es POST o PUT,
      // y se asocia al ID del documento devuelto (si es POST) o al ID existente (si es PUT).
      switchMap((respuestaDTO: any) => {

        // Obtenemos el ID del documento: ID existente si es edición, o ID recién creado si es nuevo
        const idDocumentoProcesado = this.isEditMode
          ? this.data.documento!.idDocumento
          : respuestaDTO.idDocumento;
        const formValue = this.documentForm.value;
        if (archivosParaSubir.length === 0) {
          // Si no hay archivos nuevos para subir, terminamos aquí
          return of({ success: true, message: 'Documento guardado sin archivos nuevos.' });
        }
        // --- LÓGICA DE PARAMETRIZACIÓN (SWITCH) ---
        switch (this.politicaDeNombreado) {

          // --- Caso Futuro 1 ---
          case 'titulo':
            console.log("Política de nombrado: Título. (Endpoint futuro)");
            // Descomentar cuando el backend esté listo:
            // return this.documentService.subirArchivosConTitulo(
            //   idDocumentoCreado,
            //   archivosParaSubir,
            //   formValue.titulo
            // );

            // Temporal: Usar el original mientras no exista el endpoint
            return this.documentService.subirArchivos(idDocumentoProcesado, archivosParaSubir);

          // --- Caso Futuro 2 ---
          case 'numDocumento':
            console.log("Política de nombrado: N° Documento. (Endpoint futuro)");
            // Descomentar cuando el backend esté listo:
            // return this.documentService.subirArchivosConNumDoc(
            //   idDocumentoCreado,
            //   archivosParaSubir,
            //   formValue.numDocumento
            // );

            // Temporal: Usar el original mientras no exista el endpoint
            return this.documentService.subirArchivos(idDocumentoProcesado, archivosParaSubir);

          // --- Caso Actual ---
          case 'original':
          default:
            console.log("Política de nombrado: Original.");
            // Usamos el método 'subirArchivos' que SÍ existe en el servicio
            return this.documentService.subirArchivos(idDocumentoProcesado, archivosParaSubir);
        }
      })

    ).subscribe({
      // --- ÉXITO ---
    next: (respuestaSubida) => {
    this.isLoading = false;
    this.dialogRef.close(true); // Cierra el modal
    },

      // --- ERROR ---
      error: (err: HttpErrorResponse) => {
        // La lógica de SnackBar de error
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
        console.error("Error al crear documento o subir archivos:", err);
      }
    });
  }

  /**
   * @private
   * Construye el objeto DTO (JSON) exactamente como lo espera el Backend.
   * Toma los objetos completos del formulario y extrae solo sus IDs.
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
    /*const archivosSimulados: any[] = this.archivosParaSubir.map((file, index) => ({
      nombre: file.name,
      url: `/simulado/uploads/${file.name}`
    }));
    */

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
      // Incluir Archivos Simulados si el Backend los espera
      // Por ahora, se incluye para no perder la información de archivos en la simulación local del Frontend:
      // archivos: archivosSimulados, // <-- Revisar con el Backend si se necesita realmente
      // La fecha de creación la pone el Backend, pero la usamos para el preview:
      fechaCreacion: this.toISODateString(formValue.fechaCreacion)
  };

    };
  /**
   * @private
   * Construye el objeto `Documento` completo (con objetos anidados)
   * necesario para alimentar el modal de previsualización.
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
  /**
   * @private
   * Rellena el formulario con los datos de un documento existente.
   */
  /**
   * @private
   * Rellena el formulario con los datos de un documento existente.
   * Esta versión busca los objetos correctos en los catálogos.
   */
  /**
  * @private
  * Rellena el formulario con los datos de un documento existente.
  * Esta versión funciona porque el 'documento' recibido ya fue
  * hidratado por 'document-service' y contiene los OBJETOS completos.
  */
  private fillFormForEdit(documento: Documento, catalogos: any): void {
   // Buscamos la *instancia correcta* del objeto en los catálogos cargados
    const tipoDocCorrecto = catalogos.tipos.find(
      (t: TipoDocumento) => t.idTipoDocumento === documento.tipoDocumento.idTipoDocumento
    );
    const sectorCorrecto = catalogos.sectores.find(
      (s: Sector) => s.idSector === documento.sector.idSector
    );
    const estadoCorrecto = catalogos.estados.find(
      (e: EstadoDocumento) => e.idEstado === documento.estado.idEstado
    );
    // --- FIN DE CORRECCIÓN ---

    this.documentForm.patchValue({
      titulo: documento.titulo,
      numDocumento: documento.numDocumento,
      fechaCreacion: documento.fechaCreacion,
      resumen: documento.resumen,

      // Asignamos las instancias correctas que encontramos
      tipoDocumento: tipoDocCorrecto,
      sector: sectorCorrecto,
      estado: estadoCorrecto,

      // Asignación de arreglos
      // (Estos también necesitan el mismo tratamiento si fallan)
      palabrasClave: documento.palabrasClave,
      referencias: documento.referencias
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

    // Limpiar input real (ESTO ES LO QUE TE FALTA)
    if (this.referenciaInput) {
      this.referenciaInput.nativeElement.value = '';
    }

    // Limpiar el FormControl
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


 // MÉTODO DE FILTRADO (idéntico al de referencias)
filtrarPalabrasClave(texto: string): PalabraClave[] {
  const filtro = (texto || '').toLowerCase();
  return this.palabrasClaveDisponibles.filter(p =>
    p.nombre.toLowerCase().includes(filtro)
  );
}



// Agregar palabra clave
addPalabraClave(palabra: PalabraClave): void {
  if (!this.palabrasClaveSeleccionadas.some(p => p.idPalabraClave === palabra.idPalabraClave)) {
    this.palabrasClaveSeleccionadas.push(palabra);
  }

  // Limpiar input real (evita congelamientos)
  if (this.palabraClaveInput) {
    this.palabraClaveInput.nativeElement.value = '';
  }

  // Limpiar FormControl (obligatorio para refrescar el autocomplete)
  this.palabraClaveCtrl.setValue('');

  // Actualizar el formulario si corresponde
  this.documentForm.get('palabrasClave')?.setValue(this.palabrasClaveSeleccionadas);
}

// Remover
removePalabraClave(palabra: PalabraClave): void {
  const index = this.palabrasClaveSeleccionadas.indexOf(palabra);
  if (index >= 0) {
    this.palabrasClaveSeleccionadas.splice(index, 1);
  }

  // Actualiza FormControl del form
  this.documentForm.get('palabrasClave')?.setValue(this.palabrasClaveSeleccionadas);
}


}
