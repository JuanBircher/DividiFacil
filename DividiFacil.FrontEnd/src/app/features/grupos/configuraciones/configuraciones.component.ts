import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { GrupoService } from '../../../core/services/grupo.service';
import { GrupoCreacionDto } from '../../../core/models/grupo.model'; // 🔧 IMPORTAR desde models
import { NotificacionService, ConfiguracionNotificacionesDto } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/auth.service';
import { GrupoConMiembrosDto } from '../../../core/models/grupo.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface ModoOperacionInfo {
  valor: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class ConfiguracionesComponent implements OnInit, OnDestroy {
  @Input() grupo!: GrupoConMiembrosDto;
  @Input() esAdministrador: boolean = false;

  private destroy$ = new Subject<void>();

  // 🔧 AGREGAR: Estados de carga faltantes
  loading = false;
  guardandoGrupo = false;
  guardandoNotificaciones = false;
  guardando = false; // ✅ Propiedad que faltaba

  // Formularios
  grupoForm: FormGroup;
  notificacionesForm: FormGroup;

  // Datos
  configuracionNotificaciones: ConfiguracionNotificacionesDto | null = null;
  usuarioActual: any;
  grupoOriginal: any; // ✅ Para detectar cambios

  // Opciones de configuración
  modosOperacion: ModoOperacionInfo[] = [
    {
      valor: 'Estandar',
      nombre: 'Estándar',
      descripcion: 'Modo general para cualquier tipo de grupo',
      icono: 'group'
    },
    {
      valor: 'Pareja',
      nombre: 'Pareja',
      descripcion: 'Optimizado para gastos entre dos personas',
      icono: 'favorite'
    },
    {
      valor: 'Roommates',
      nombre: 'Compañeros de Cuarto',
      descripcion: 'Diseñado para gastos compartidos de vivienda',
      icono: 'home'
    }
  ];

  frecuenciasRecordatorio = [
    { valor: 'Diario', nombre: 'Diario' },
    { valor: 'Semanal', nombre: 'Semanal' },
    { valor: 'Mensual', nombre: 'Mensual' }
  ];

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private notificacionService: NotificacionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.grupoForm = this.fb.group({
      nombreGrupo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
      modoOperacion: ['Estandar', [Validators.required]]
    });

    this.notificacionesForm = this.fb.group({
      notificarNuevosPagos: [true],
      notificarNuevosGastos: [true],
      notificarInvitacionesGrupo: [true],
      notificarCambiosEstadoPagos: [true],
      recordatoriosDeudas: [true],
      recordatoriosPagos: [true],
      frecuenciaRecordatorios: ['Semanal']
    });
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR DATOS INICIALES
   */
  cargarDatosIniciales(): void {
    this.loading = true;

    // Guardar datos originales para detectar cambios
    this.grupoOriginal = {
      nombreGrupo: this.grupo.nombreGrupo,
      descripcion: this.grupo.descripcion || '',
      modoOperacion: this.grupo.modoOperacion
    };

    // Cargar datos del grupo en el formulario
    this.grupoForm.patchValue(this.grupoOriginal);

    // Cargar configuración de notificaciones
    this.notificacionService.obtenerConfiguracion(this.usuarioActual?.idUsuario || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.configuracionNotificaciones = response.data;
            this.notificacionesForm.patchValue(response.data);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error cargando configuración de notificaciones:', err);
        }
      });
  }

  /**
   * 💾 GUARDAR CONFIGURACIÓN DEL GRUPO
   */
  guardarConfiguracionGrupo(): void {
    if (this.grupoForm.invalid || !this.esAdministrador) return;

    this.guardandoGrupo = true;
    this.guardando = true; // ✅ También actualizar guardando general

    const grupoDto: GrupoCreacionDto = {
      nombreGrupo: this.grupoForm.get('nombreGrupo')?.value,
      descripcion: this.grupoForm.get('descripcion')?.value,
      modoOperacion: this.grupoForm.get('modoOperacion')?.value
    };

    this.grupoService.actualizarGrupo(this.grupo.idGrupo, grupoDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.guardandoGrupo = false;
          this.guardando = false;

          if (response.exito) {
            this.snackBar.open('Configuración del grupo actualizada correctamente', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            // Actualizar datos originales y del grupo padre
            this.grupoOriginal = { ...grupoDto };
            this.grupo.nombreGrupo = grupoDto.nombreGrupo;
            this.grupo.descripcion = grupoDto.descripcion;
            this.grupo.modoOperacion = grupoDto.modoOperacion;
          } else {
            this.snackBar.open(response.mensaje || 'Error al actualizar configuración', 'Cerrar', { 
              duration: 3000 
            });
          }
        },
        error: (err) => {
          this.guardandoGrupo = false;
          this.guardando = false;
          this.snackBar.open('Error al actualizar configuración del grupo', 'Cerrar', { 
            duration: 3000 
          });
          console.error('Error:', err);
        }
      });
  }

  /**
   * 🔔 GUARDAR CONFIGURACIÓN DE NOTIFICACIONES
   */
  guardarConfiguracionNotificaciones(): void {
    if (this.notificacionesForm.invalid) return;

    this.guardandoNotificaciones = true;

    const configuracion: ConfiguracionNotificacionesDto = {
      idConfiguracion: this.configuracionNotificaciones?.idConfiguracion || '',
      idUsuario: this.usuarioActual?.idUsuario || '',
      ...this.notificacionesForm.value
    };

    this.notificacionService.actualizarConfiguracion(configuracion, this.usuarioActual?.idUsuario || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.guardandoNotificaciones = false;
          if (response.exito) {
            this.snackBar.open('Configuración de notificaciones actualizada', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.configuracionNotificaciones = configuracion;
          } else {
            this.snackBar.open(response.mensaje || 'Error al actualizar notificaciones', 'Cerrar', { 
              duration: 3000 
            });
          }
        },
        error: (err) => {
          this.guardandoNotificaciones = false;
          this.snackBar.open('Error al actualizar configuración de notificaciones', 'Cerrar', { 
            duration: 3000 
          });
          console.error('Error:', err);
        }
      });
  }

  /**
   * 🗑️ ELIMINAR GRUPO
   */
  confirmarEliminarGrupo(): void {
    if (!this.esAdministrador) return;

    const confirmacion = confirm(
      `¿Estás seguro de eliminar el grupo "${this.grupo.nombreGrupo}"?\n\n` +
      'Esta acción es IRREVERSIBLE y eliminará:\n' +
      '• Todos los gastos del grupo\n' +
      '• Todos los pagos asociados\n' +
      '• Toda la información del grupo\n\n' +
      'Escribe "ELIMINAR" para confirmar:'
    );

    if (confirmacion) {
      const confirmacionTexto = prompt('Escribe "ELIMINAR" para confirmar:');
      
      if (confirmacionTexto === 'ELIMINAR') {
        this.eliminarGrupo();
      } else {
        this.snackBar.open('Eliminación cancelada', 'Cerrar', { duration: 2000 });
      }
    }
  }

  /**
   * 🗑️ ELIMINAR GRUPO - EJECUTAR
   */
  private eliminarGrupo(): void {
    this.loading = true;

    this.grupoService.eliminarGrupo(this.grupo.idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito) {
            this.snackBar.open('Grupo eliminado correctamente', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            this.router.navigate(['/grupos']);
          } else {
            this.snackBar.open(response.mensaje || 'Error al eliminar grupo', 'Cerrar', { 
              duration: 3000 
            });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error al eliminar grupo', 'Cerrar', { duration: 3000 });
          console.error('Error:', err);
        }
      });
  }

  /**
   * 🔄 RESETEAR FORMULARIOS
   */
  resetearFormularioGrupo(): void {
    this.grupoForm.patchValue(this.grupoOriginal);
  }

  resetearFormularioNotificaciones(): void {
    if (this.configuracionNotificaciones) {
      this.notificacionesForm.patchValue(this.configuracionNotificaciones);
    }
  }

  /**
   * 🎯 DETECTAR CAMBIOS - MÉTODOS CORREGIDOS
   */
  // ✅ CORREGIR: Nombre de método debe coincidir con template
  haycambiosGrupo(): boolean {
    if (!this.grupoOriginal) return false;
    
    const valores = this.grupoForm.value;
    return valores.nombreGrupo !== this.grupoOriginal.nombreGrupo ||
           valores.descripcion !== this.grupoOriginal.descripcion ||
           valores.modoOperacion !== this.grupoOriginal.modoOperacion;
  }

  hayChangiosNotificaciones(): boolean {
    if (!this.configuracionNotificaciones) return true;
    
    const valores = this.notificacionesForm.value;
    const config = this.configuracionNotificaciones;
    
    return valores.notificarNuevosPagos !== config.notificarNuevosPagos ||
           valores.notificarNuevosGastos !== config.notificarNuevosGastos ||
           valores.notificarInvitacionesGrupo !== config.notificarInvitacionesGrupo ||
           valores.notificarCambiosEstadoPagos !== config.notificarCambiosEstadoPagos ||
           valores.recordatoriosDeudas !== config.recordatoriosDeudas ||
           valores.recordatoriosPagos !== config.recordatoriosPagos ||
           valores.frecuenciaRecordatorios !== config.frecuenciaRecordatorios;
  }

  /**
   * 🎨 MÉTODOS DE UI
   */
  getModoOperacionInfo(valor: string): ModoOperacionInfo {
    return this.modosOperacion.find(m => m.valor === valor) || this.modosOperacion[0];
  }

  getErrorMessage(formControl: string, formGroup: FormGroup = this.grupoForm): string {
    const control = formGroup.get(formControl);
    
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    return '';
  }
}