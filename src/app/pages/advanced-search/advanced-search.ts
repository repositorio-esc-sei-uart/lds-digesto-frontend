import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
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
    MatIconModule
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

  @Input() isDropdownMode = false; // Detecta si está en modo dropdown
  @Output() searchApplied = new EventEmitter<any>();
  @Output() searchCancelled = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    //private dialogRef: MatDialogRef<AdvancedSearch>,
    private sectorService: SectorService,
    private statusService: StatusDocumentService,
    private typeService: TypeDocumentService,
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

  onSearch(): void {
    const formValue = this.advancedForm.getRawValue();
    console.log('🔍 FormValue RAW:', formValue);
    console.log('📅 fechaDesde:', formValue.fechaDesde);
    console.log('📅 fechaDesde ISO:', formValue.fechaDesde?.toISOString());
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
}
