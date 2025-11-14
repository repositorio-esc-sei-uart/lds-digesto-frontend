import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Sector } from '../../interfaces/sector-model';
import { EstadoDocumento } from '../../interfaces/status-document-model';
import { TipoDocumento } from '../../interfaces/type-document-model';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AdvancedSearch>,
    private sectorService: SectorService,
    private statusService: StatusDocumentService,
    private typeService: TypeDocumentService
  ) {
    this.advancedForm = this.fb.group({
      titulo: [null],
      numDocumento: [null],
      idTipoDocumento: [null],
      idSector: [null],
      idEstado: [null],
      fechaDesde: [null],
      fechaHasta: [null],
      excluirPalabras: [null]
    });
  }

  ngOnInit() {
    // Cargar datos para los dropdowns
    this.sectores$ = this.sectorService.getSectores();
    this.estados$ = this.statusService.getEstados();
    this.tipos$ = this.typeService.getTiposDocumento();
  }

  onSearch(): void {
    // Devuelve los valores del formulario al componente que lo abrió
    this.dialogRef.close(this.advancedForm.value);
  }

  onClear(): void {
    this.advancedForm.reset();
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin devolver nada
  }
}
