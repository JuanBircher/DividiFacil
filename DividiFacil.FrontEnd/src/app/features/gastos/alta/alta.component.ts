import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { GastoService } from '../../../core/services/gasto.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { GastoCreacionDto, DetalleGastoCreacionDto } from '../../../core/models/gasto.model';
import { GrupoConMiembrosDto, MiembroGrupoDto, MiembroGrupoSimpleDto } from '../../../core/models/grupo.model';

interface ParticipanteGasto {
  miembro: MiembroGrupoSimpleDto;
  monto: number;
  porcentaje: number;
  seleccionado: boolean;
}

@Component({
  selector: 'app-alta',
  standalone: true,
  templateUrl: './alta.component.html',
  styleUrls: ['./alta.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule
  ]
})
export class AltaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Formularios del stepper
  detallesForm: FormGroup;
  participantesForm: FormGroup;
  
  // Datos
  grupo: GrupoConMiembrosDto | null = null;
  participantes: ParticipanteGasto[] = [];
  idGrupo: string = '';
  
  // Estados
  loading = false;
  guardando = false;
  
  // Opciones
  tiposDivision = [
    { valor: 'equitativa', nombre: 'División Equitativa', descripcion: 'Dividir el monto por igual entre todos' },
    { valor: 'manual', nombre: 'División Manual', descripcion: 'Especificar monto para cada persona' },
    { valor: 'porcentajes', nombre: 'División por Porcentajes', descripcion: 'Asignar porcentaje a cada persona' }
  ];
  
  categorias = [
    'Alimentación', 'Transporte', 'Entretenimiento', 'Servicios', 
    'Compras', 'Salud', 'Viajes', 'Otros'
  ];

  constructor(
    private fb: FormBuilder,
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.detallesForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      categoria: [''],
      fechaGasto: [new Date().toISOString().split('T')[0]]
    });

    this.participantesForm = this.fb.group({
      tipoDivision: ['equitativa', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupo = params['grupo'];
        if (this.idGrupo) {
          this.cargarGrupo();
        } else {
          this.router.navigate(['/grupos']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR DATOS DEL GRUPO
   */
  cargarGrupo(): void {
    this.loading = true;
    
    this.grupoService.obtenerMiembros(this.idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.grupo = response.data;
            this.inicializarParticipantes();
          } else {
            this.snackBar.open('Error al cargar grupo', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/grupos']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error al cargar grupo', 'Cerrar', { duration: 3000 });
          console.error('Error:', err);
        }
      });
  }

  /**
   * 👥 INICIALIZAR LISTA DE PARTICIPANTES
   */
  inicializarParticipantes(): void {
    if (!this.grupo) return;
    
    this.participantes = this.grupo.miembros.map(miembro => ({
      miembro,
      monto: 0,
      porcentaje: 0,
      seleccionado: true // Por defecto todos seleccionados
    }));
    
    this.calcularDivision();
  }

  /**
   * 🧮 CALCULAR DIVISIÓN SEGÚN TIPO SELECCIONADO
   */
  calcularDivision(): void {
    const tipoDivision = this.participantesForm.get('tipoDivision')?.value;
    const montoTotal = this.detallesForm.get('monto')?.value || 0;
    const participantesSeleccionados = this.participantes.filter(p => p.seleccionado);
    
    if (montoTotal <= 0 || participantesSeleccionados.length === 0) return;

    switch (tipoDivision) {
      case 'equitativa':
        this.calcularDivisionEquitativa(montoTotal, participantesSeleccionados);
        break;
      case 'porcentajes':
        this.calcularDivisionPorcentajes(montoTotal, participantesSeleccionados);
        break;
      case 'manual':
        // No calcular automáticamente, el usuario ingresa manualmente
        break;
    }
  }

  /**
   * 🟰 DIVISIÓN EQUITATIVA
   */
  calcularDivisionEquitativa(montoTotal: number, participantesSeleccionados: ParticipanteGasto[]): void {
    const montoPorPersona = Math.round((montoTotal / participantesSeleccionados.length) * 100) / 100;
    
    participantesSeleccionados.forEach((participante, index) => {
      // Ajustar el último para que la suma sea exacta
      if (index === participantesSeleccionados.length - 1) {
        const montoAcumulado = montoPorPersona * (participantesSeleccionados.length - 1);
        participante.monto = montoTotal - montoAcumulado;
      } else {
        participante.monto = montoPorPersona;
      }
      participante.porcentaje = Math.round((participante.monto / montoTotal) * 100);
    });
  }

  /**
   * 📊 DIVISIÓN POR PORCENTAJES
   */
  calcularDivisionPorcentajes(montoTotal: number, participantesSeleccionados: ParticipanteGasto[]): void {
    const porcentajePorPersona = Math.round(100 / participantesSeleccionados.length);
    
    participantesSeleccionados.forEach((participante, index) => {
      if (index === participantesSeleccionados.length - 1) {
        // Ajustar el último porcentaje
        const porcentajeAcumulado = porcentajePorPersona * (participantesSeleccionados.length - 1);
        participante.porcentaje = 100 - porcentajeAcumulado;
      } else {
        participante.porcentaje = porcentajePorPersona;
      }
      participante.monto = Math.round((montoTotal * participante.porcentaje / 100) * 100) / 100;
    });
  }

  /**
   * 🔄 RECALCULAR AL CAMBIAR MONTO O PARTICIPANTES
   */
  onMontoChange(): void {
    this.calcularDivision();
  }

  onParticipanteToggle(): void {
    this.calcularDivision();
  }

  onTipoDivisionChange(): void {
    this.calcularDivision();
  }

  /**
   * 🧮 RECALCULAR MONTO AL CAMBIAR PORCENTAJE
   */
  onPorcentajeChange(participante: ParticipanteGasto): void {
    const montoTotal = this.detallesForm.get('monto')?.value || 0;
    participante.monto = Math.round((montoTotal * participante.porcentaje / 100) * 100) / 100;
  }

  /**
   * 🧮 RECALCULAR PORCENTAJE AL CAMBIAR MONTO
   */
  onMontoParticipanteChange(participante: ParticipanteGasto): void {
    const montoTotal = this.detallesForm.get('monto')?.value || 0;
    if (montoTotal > 0) {
      participante.porcentaje = Math.round((participante.monto / montoTotal) * 100);
    }
  }

  /**
   * 🔧 MÉTODOS FALTANTES PARA EL TEMPLATE
   */
  
  cancelar(): void {
    this.router.navigate(['/gastos'], { 
      queryParams: { grupo: this.idGrupo }  
    });
  }

  trackByParticipante(index: number, participante: ParticipanteGasto): any {
    return participante.miembro.idMiembro;
  }

  obtenerParticipantesSeleccionados(): ParticipanteGasto[] {
    return this.participantes.filter(p => p.seleccionado);
  }

  validarDetalles(): boolean {
    return this.detallesForm.valid;
  }

  validarParticipantes(): boolean {
    const participantesSeleccionados = this.obtenerParticipantesSeleccionados();
    
    if (participantesSeleccionados.length === 0) {
      return false;
    }

    const montoTotal = this.detallesForm.get('monto')?.value || 0;
    const totalCalculado = this.getTotalCalculado();
    
    // Validar que la suma coincida (con tolerancia de 1 centavo)
    return Math.abs(totalCalculado - montoTotal) <= 0.01;
  }

  getTotalCalculado(): number {
    return this.participantes
      .filter(p => p.seleccionado)
      .reduce((total, p) => total + (p.monto || 0), 0);
  }

  async crearGasto(): Promise<void> {
    if (!this.validarParticipantes()) {
      this.snackBar.open('Por favor verifica que la división sea correcta', 'Cerrar', {
        duration: 5000
      });
      return;
    }

    this.guardando = true;

    try {
      const participantesSeleccionados = this.obtenerParticipantesSeleccionados();
      
      const detalles: DetalleGastoCreacionDto[] = participantesSeleccionados.map(p => ({
        idMiembroDeudor: p.miembro.idMiembro,  
        monto: p.monto                         
      }));

      const gastoCreacion: GastoCreacionDto = {
        idGrupo: this.idGrupo,                 
        descripcion: this.detallesForm.get('descripcion')?.value,
        monto: this.detallesForm.get('monto')?.value,
        fechaGasto: this.detallesForm.get('fechaGasto')?.value,
        categoria: this.detallesForm.get('categoria')?.value || undefined,
        detalles: detalles 
      };

      await this.gastoService.crearGasto(gastoCreacion).toPromise();

      this.snackBar.open('¡Gasto creado exitosamente!', 'Cerrar', {
        duration: 3000
      });

      this.router.navigate(['/gastos'], { 
        queryParams: { grupo: this.idGrupo } 
      });

    } catch (error) {
      console.error('Error al crear gasto:', error);
      this.snackBar.open('Error al crear el gasto. Inténtalo de nuevo.', 'Cerrar', {
        duration: 5000
      });
    } finally {
      this.guardando = false;
    }
  }

  // Exponer Math para el template
  Math = Math;
}
