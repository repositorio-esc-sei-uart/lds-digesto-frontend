import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { Sector } from '../../interfaces/sector-model';
import { EstadoDocumento } from '../../interfaces/status-document-model';
import { TipoDocumento } from '../../interfaces/type-document-model';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SectorService } from '../../services/sector-service';
import { StatusDocumentService } from '../../services/status-document-service';
import { TypeDocumentService } from '../../services/type-document-service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PalabraClave } from '../../interfaces/keyword-document-model';
import { KeywordDocumentService } from '../../services/keyword-document-service';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  templateUrl: './advanced-search.html',
  styleUrl: './advanced-search.css'
})
export class AdvancedSearch implements OnInit {
  advancedForm: FormGroup;
  // Observables para los dropdowns
  sectores$!: Observable<Sector[]>;
  estados$!: Observable<EstadoDocumento[]>;
  tipos$!: Observable<TipoDocumento[]>;
  // Para el autocomplete de palabras clave
  palabrasClaveDisponibles: PalabraClave[] = [];
  palabrasClaveSeleccionadas: PalabraClave[] = [];
  palabraClaveControl = new FormControl('');
  palabrasClaveFilteradas$!: Observable<PalabraClave[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('palabraClaveInput') palabraClaveInput!: ElementRef<HTMLInputElement>;
  @Input() isDropdownMode = false; // Detecta si está en modo dropdown
  @Output() searchApplied = new EventEmitter<any>();
  @Output() searchCancelled = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private sectorService: SectorService,
    private statusService: StatusDocumentService,
    private typeService: TypeDocumentService,
    private palabraClaveService: KeywordDocumentService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef: MatDialogRef<AdvancedSearch>,
    private cdr: ChangeDetectorRef
  ) {
    this.advancedForm = this.fb.group({
      titulo: [''],
      numDocumento: [''],
      excluirPalabras: [''],
      idTipoDocumento: [null],
      idEstado: [null],
      idSector: [null],
      fechaDesde: [null],
      fechaHasta: [{ value: null, disabled: true }]
    });
  }

  ngOnInit() {
    // Cargar datos para los dropdowns
    this.sectores$ = this.sectorService.getSectores();
    this.estados$ = this.statusService.getEstados();
    this.tipos$ = this.typeService.getTiposDocumento();

    // Cargar palabras clave disponibles
    this.palabraClaveService.getKeywords().subscribe(palabras => {
      this.palabrasClaveDisponibles = palabras;
    });

    // Configurar el filtro de autocomplete
    this.palabrasClaveFilteradas$ = this.palabraClaveControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPalabrasClave(value || ''))
    );

    // Validación de rango de fechas
    this.advancedForm.get('fechaDesde')?.valueChanges.subscribe(fechaDesde => {
      const fechaHastaControl = this.advancedForm.get('fechaHasta');

      if (fechaDesde) {
        fechaHastaControl?.enable();

        // Si ya hay una fechaHasta y es menor que fechaDesde, limpiarla
        const fechaHasta = fechaHastaControl?.value;
        if (fechaHasta && fechaHasta < fechaDesde) {
          fechaHastaControl?.setValue(null);
        }
      } else {
        fechaHastaControl?.disable();
        fechaHastaControl?.setValue(null);
      }
    });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // Filtro para el autocomplete
  private _filterPalabrasClave(value: string): PalabraClave[] {
    const filterValue = value.toLowerCase();

    // Filtra palabras que NO estén ya seleccionadas
    return this.palabrasClaveDisponibles.filter(palabra =>
      !this.palabrasClaveSeleccionadas.find(p => p.idPalabraClave === palabra.idPalabraClave) &&
      palabra.nombre.toLowerCase().includes(filterValue)
    );
  }

  // Cuando se selecciona una palabra del autocomplete
  seleccionarPalabraClave(event: MatAutocompleteSelectedEvent): void {
    const palabra = event.option.value as PalabraClave;
    // Evitar duplicados
    if (!this.palabrasClaveSeleccionadas.find(p => p.idPalabraClave === palabra.idPalabraClave)) {
      this.palabrasClaveSeleccionadas.push(palabra);
    }

    // Limpiar el input
    if (this.palabraClaveInput) {
      this.palabraClaveInput.nativeElement.value = '';
    }
    this.palabraClaveControl.setValue('');
  }

  // Remover una palabra clave seleccionada
  removerPalabraClave(palabra: PalabraClave): void {
    const index = this.palabrasClaveSeleccionadas.indexOf(palabra);
    if (index >= 0) {
      this.palabrasClaveSeleccionadas.splice(index, 1);
    }
  }

  onSearch(): void {
    const formValue = this.advancedForm.getRawValue();

    // Incluir IDs de palabras clave seleccionadas
    if (this.palabrasClaveSeleccionadas.length > 0) {
      formValue.idsPalabrasClave = this.palabrasClaveSeleccionadas.map(p => p.idPalabraClave);
    }

    if (this.isDropdownMode) {
      // Modo dropdown: emite evento
      this.searchApplied.emit(formValue);
    } else {
      // Modo modal: cierra el dialog
      this.dialogRef?.close(formValue);
    }
  }

  onClear(): void {
    this.advancedForm.reset();
    this.advancedForm.get('fechaHasta')?.disable();
    this.palabrasClaveSeleccionadas = [];
    if (this.isDropdownMode) {
      this.searchApplied.emit({});
    }
  }

  onCancel(): void {
    if (this.isDropdownMode) {
      this.searchCancelled.emit();
    } else {
      this.dialogRef?.close();
    }
  }

  // Método para mostrar el nombre en el autocomplete
  displayFn(palabra: PalabraClave): string {
    return '';
  }

  // Prevenir submit en el input de chips
  onChipInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
