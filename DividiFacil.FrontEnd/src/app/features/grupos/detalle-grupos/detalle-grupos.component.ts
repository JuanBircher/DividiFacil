import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

// 🔧 USAR TUS SERVICIOS CORREGIDOS
import { GrupoService } from '../../../core/services/grupo.service';
import { GastoService } from '../../../core/services/gasto.service';
import { PagoService } from '../../../core/services/pago.service';
import { BalanceService } from '../../../core/services/balance.service';
import { AuthService } from '../../../core/auth.service';

// 🔧 USAR TUS MODELS EXISTENTES
import { CambioRolDto, GrupoConMiembrosDto, InvitacionDto, MiembroGrupoSimpleDto } from '../../../core/models/grupo.model';
import { GastoDto } from '../../../core/models/gasto.model';
import { Pago } from '../../../core/models/pago.model';
import { BalanceGrupoDto, MovimientoDto } from '../../../core/models/balance.model';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { ConfiguracionesComponent } from '../configuraciones/configuraciones.component';

interface EstadisticasGrupo {
  totalGastos: number;
  totalMiembros: number;
  gastoPromedio: number;
  gastosEsteMes: number;
  ultimaActividad: string;
}

interface ActividadReciente {
  id: string;
  tipo: 'gasto' | 'pago' | 'movimiento';
  descripcion: string;
  usuario: string;
  fecha: string;
  monto?: number;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-detalle-grupos',
  standalone: true,
  templateUrl: './detalle-grupos.component.html',
  styleUrls: ['./detalle-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // 🚀 AGREGAR ESTO
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    CardComponent,
    LoadingSpinnerComponent,
    DateFormatPipe,
    CurrencyFormatPipe,
    ConfiguracionesComponent // ✅ AGREGAR: Import del componente
  ]
})
export class DetalleGruposComponent implements OnInit {
  private destroy$ = new Subject<void>();
  
  // Estados de carga
  loading = true;
  error: string | null = null;

  // Datos principales
  idGrupo: string = '';
  grupo: GrupoConMiembrosDto | null = null;
  usuarioActual: any;
  miembros: MiembroGrupoSimpleDto[] = [];
  
  // Estadísticas
  estadisticas: EstadisticasGrupo = {
    totalGastos: 0,
    totalMiembros: 0,
    gastoPromedio: 0,
    gastosEsteMes: 0,
    ultimaActividad: ''
  };

  // Actividad reciente
  actividadReciente: ActividadReciente[] = [];
  
  // Balance del grupo
  balanceGrupo: BalanceGrupoDto | null = null;
  
  // Permisos del usuario
  esAdministrador = false;
  puedeEditarGrupo = false;
  puedeInvitarMiembros = false;

  // ➕ AGREGAR: Variables para gestión de miembros
  mostrarFormularioAgregar = false;
  emailNuevoMiembro = '';
  procesandoAccion = false;

  // 🔧 AGREGAR: Variables para códigos de acceso
  codigoAccesoActual: string | null = null;
  generandoCodigo = false;
  mostrarModalCodigo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private pagoService: PagoService,
    private balanceService: BalanceService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // 🚀 AGREGAR ESTO
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    // ✅ USAR PARÁMETRO CORRECTO
    this.idGrupo = this.route.snapshot.paramMap.get('idGrupo') || '';
    
    console.log('🔍 ID Grupo obtenido de ruta:', this.idGrupo);
    
    if (this.idGrupo) {
      this.cargarDatosCompletos();
    } else {
      this.error = 'ID de grupo no válido';
      this.loading = false;
    }
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Carga todos los datos del grupo
   * USANDO TUS SERVICIOS EXISTENTES
   */
  cargarDatosCompletos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    // 🔧 CORREGIDO: Usar método correcto
    this.grupoService.obtenerGrupoConMiembros(this.idGrupo).subscribe({
      next: (response) => {
        console.log('📦 Respuesta grupo:', response);
        if (response.exito && response.data) {
          this.grupo = response.data;
          this.miembros = response.data.miembros || [];
          this.configurarPermisos();
          console.log('👥 Grupo cargado:', this.grupo);
        } else {
          this.error = response.mensaje || 'Error al cargar el grupo';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error cargando grupo:', err);
        this.error = 'Error al cargar el grupo';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * 🔐 Configurar permisos del usuario actual
   */
  private configurarPermisos(): void {
    if (!this.grupo || !this.usuarioActual) return;

    const miembroActual = this.grupo.miembros.find(
      m => m.idUsuario === this.usuarioActual.idUsuario
    );

    if (miembroActual) {
      this.esAdministrador = miembroActual.rol === 'Administrador';
      this.puedeEditarGrupo = this.esAdministrador;
      this.puedeInvitarMiembros = this.esAdministrador;
    }
  }

  /**
   * 📊 Cargar datos adicionales del grupo
   * USANDO TUS SERVICIOS EXISTENTES
   */
  private cargarDatosAdicionales(): void {
    forkJoin({
      balance: this.balanceService.obtenerBalanceGrupo(this.idGrupo),
      gastos: this.gastoService.obtenerGastosPorGrupo(this.idGrupo),
      pagos: this.pagoService.obtenerPagosPorGrupo(this.idGrupo),
      movimientos: this.balanceService.obtenerHistorialMovimientos(this.idGrupo)
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (responses) => {
        this.loading = false;
        // Procesar balance
        if (responses.balance.exito && responses.balance.data) {
          this.balanceGrupo = responses.balance.data;
        }
        // Procesar estadísticas
        const gastosData = (responses.gastos && responses.gastos.data) ? responses.gastos.data : [];
        const pagosData = (responses.pagos && responses.pagos.data) ? responses.pagos.data : [];
        this.calcularEstadisticas(gastosData, pagosData);
        // Procesar actividad reciente
        const movimientosData = (responses.movimientos && responses.movimientos.data) ? responses.movimientos.data : [];
        this.procesarActividadReciente(gastosData, pagosData, movimientosData);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar datos adicionales';
        console.error('Error cargando datos adicionales:', err);
      }
    });
  }

  /**
   * 📈 Calcular estadísticas del grupo
   */
  private calcularEstadisticas(gastos: GastoDto[], pagos: Pago[]): void {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    this.estadisticas = {
      totalGastos: gastos.length,
      totalMiembros: this.grupo?.miembros.length || 0,
      gastoPromedio: gastos.length > 0 ? 
        gastos.reduce((sum, g) => sum + g.monto, 0) / gastos.length : 0,
      gastosEsteMes: gastos.filter(g => {
        const fecha = new Date(g.fechaCreacion);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      }).length,
      ultimaActividad: this.obtenerUltimaActividad(gastos, pagos)
    };

    // Actualizar totalGastos en el grupo
    if (this.grupo) {
      this.grupo.totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    }
  }

  /**
   * 🕒 Obtener fecha de última actividad
   */
  private obtenerUltimaActividad(gastos: GastoDto[], pagos: Pago[]): string {
    const todasFechas = [
      ...gastos.map(g => new Date(g.fechaCreacion)),
      ...pagos.map(p => new Date(p.fechaCreacion))
    ];

    if (todasFechas.length === 0) return '';

    const ultimaFecha = new Date(Math.max(...todasFechas.map(f => f.getTime())));
    return ultimaFecha.toISOString();
  }

  /**
   * 📋 Procesar actividad reciente para timeline
   */
  private procesarActividadReciente(gastos: GastoDto[], pagos: Pago[], movimientos: MovimientoDto[]): void {
    const actividades: ActividadReciente[] = [];

    // Procesar gastos más recientes
    gastos.slice(0, 5).forEach(gasto => {
      actividades.push({
        id: gasto.idGasto,
        tipo: 'gasto',
        descripcion: gasto.descripcion,
        usuario: gasto.nombreMiembroPagador || 'Usuario',
        fecha: gasto.fechaCreacion,
        monto: gasto.monto,
        icono: 'receipt',
        color: 'warn'
      });
    });

    // Procesar pagos más recientes
    pagos.slice(0, 5).forEach(pago => {
      actividades.push({
        id: pago.idPago,
        tipo: 'pago',
        descripcion: `Pago: ${pago.concepto || 'Sin concepto'}`,
        usuario: pago.nombrePagador || 'Usuario',
        fecha: pago.fechaCreacion,
        monto: pago.monto,
        icono: 'payment',
        color: pago.estado === 'Completado' ? 'primary' : 'accent'
      });
    });

    // Ordenar por fecha y tomar los 10 más recientes
    this.actividadReciente = actividades
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);
  }

  /**
   * 👥 ACCIONES DE GESTIÓN DE MIEMBROS
   */
  cambiarRolMiembro(idMiembro: string, nuevoRol: string): void {
    this.grupoService.cambiarRolMiembro(this.idGrupo, idMiembro, nuevoRol)
      .subscribe({
        next: (response) => {
          if (response.exito) {
            this.snackBar.open('Rol actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.cargarDatosCompletos();
          } else {
            this.snackBar.open(response.mensaje || 'Error al cambiar rol', 'Cerrar', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error al cambiar rol:', error);
          this.snackBar.open('Error al cambiar rol', 'Cerrar', { duration: 3000 });
        }
      });
  }

  invitarMiembro(): void {
    if (this.emailNuevoMiembro.trim()) {
      const invitacion: InvitacionDto = {
        emailInvitado: this.emailNuevoMiembro.trim()
      };
      this.grupoService.agregarMiembro(this.idGrupo, invitacion)
        .subscribe({
          next: (response) => {
            if (response.exito) {
              this.snackBar.open('Invitación enviada exitosamente', 'Cerrar', { duration: 3000 });
              this.emailNuevoMiembro = '';
              this.cargarDatosCompletos();
            } else {
              this.snackBar.open(response.mensaje || 'Error al enviar invitación', 'Cerrar', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error al enviar invitación:', error);
            this.snackBar.open('Error al enviar invitación', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  /**
   * 📋 COPIAR CÓDIGO AL PORTAPAPELES
   */
  copiarCodigo(): void {
    if (!this.codigoAccesoActual) return;

    navigator.clipboard.writeText(this.codigoAccesoActual).then(() => {
      this.snackBar.open('Código copiado al portapapeles', 'Cerrar', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Error al copiar código', 'Cerrar', { duration: 2000 });
    });
  }

  /**
   * 🔗 COMPARTIR CÓDIGO
   */
  compartirCodigo(): void {
    if (!this.codigoAccesoActual) return;

    const nombreGrupo = this.grupo?.nombreGrupo || 'el grupo';
    const mensaje = `¡Te invito a unirte al grupo "${nombreGrupo}"!\n\nCódigo de acceso: ${this.codigoAccesoActual}\n\nIngresa este código en DividiFácil para unirte.`;

    if (navigator.share) {
      navigator.share({
        title: `Invitación a ${nombreGrupo}`,
        text: mensaje
      });
    } else {
      // Fallback: copiar mensaje completo
      navigator.clipboard.writeText(mensaje).then(() => {
        this.snackBar.open('Mensaje de invitación copiado', 'Cerrar', { duration: 3000 });
      });
    }
  }

  /**
   * ❌ CERRAR MODAL CÓDIGO
   */
  cerrarModalCodigo(): void {
    this.mostrarModalCodigo = false;
    this.codigoAccesoActual = null;
  }

  eliminarMiembro(idMiembro: string): void {
    if (confirm('¿Estás seguro de eliminar este miembro?')) {
      this.grupoService.eliminarMiembro(this.idGrupo, idMiembro)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.exito) {
              this.snackBar.open('Miembro eliminado correctamente', 'Cerrar', { duration: 3000 });
              this.cargarDatosCompletos(); // Recargar datos
            }
          },
          error: (err) => {
            this.snackBar.open('Error al eliminar miembro', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  cambiarRol(idMiembro: string, nuevoRol: string): void {
    this.grupoService.cambiarRolMiembro(this.idGrupo, idMiembro, nuevoRol)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito) {
            this.snackBar.open('Rol actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.cargarDatosCompletos(); // Recargar datos
          }
        },
        error: (err) => {
          this.snackBar.open('Error al cambiar rol', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 👥 GESTIÓN SIMPLIFICADA DE MIEMBROS
   */
  toggleFormularioAgregar(): void {
    this.mostrarFormularioAgregar = !this.mostrarFormularioAgregar;
    this.emailNuevoMiembro = '';
  }

  agregarMiembroPorEmail(): void {
    if (!this.emailNuevoMiembro.trim()) {
      this.snackBar.open('Ingrese un email válido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.procesandoAccion = true;

    this.grupoService.agregarMiembro(this.idGrupo, { 
      emailInvitado: this.emailNuevoMiembro.trim() 
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.procesandoAccion = false;
        if (response.exito) {
          this.snackBar.open('Miembro agregado correctamente', 'Cerrar', { duration: 3000 });
          this.emailNuevoMiembro = '';
          this.mostrarFormularioAgregar = false;
          this.cargarDatosCompletos(); // Recargar datos
        } else {
          this.snackBar.open(response.mensaje || 'Error al agregar miembro', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.procesandoAccion = false;
        this.snackBar.open('Error al agregar miembro', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * ⚙️ ACCIONES DE CONFIGURACIÓN
   */
  editarGrupo(): void {
    this.router.navigate(['/grupos/alta'], { 
      queryParams: { id: this.idGrupo, modo: 'editar' } 
    });
  }

  /**
   * 💰 ACCIONES DE GASTOS
   */
  crearGasto(): void {
    this.router.navigate(['/gastos/alta'], { 
      queryParams: { idGrupo: this.idGrupo } 
    });
  }

  verHistorialGastos(): void {
    this.router.navigate(['/gastos'], { 
      queryParams: { idGrupo: this.idGrupo } 
    });
  }

  /**
   * 📊 VER BALANCE DEL GRUPO
   */
  verBalanceGrupo(): void {
    this.router.navigate(['/balances/grupo', this.idGrupo]);
  }

  /**
   * 💰 VER PAGOS DEL GRUPO
   */
  verPagosGrupo(): void {
    this.router.navigate(['/listado-pagos'], {
      queryParams: { idGrupo: this.idGrupo }
    });
  }

  /**
   * 💳 CREAR PAGO RÁPIDO
   */
  crearPagoRapido(): void {
    this.router.navigate(['/alta-pagos'], {
      queryParams: { idGrupo: this.idGrupo }
    });
  }

  /**
   * 🔄 ACCIONES DE ACTUALIZACIÓN
   */
  refrescarDatos(): void {
    this.cargarDatosCompletos();
  }

  /**
   * 🎨 MÉTODOS DE UI
   */
  getRolColor(rol: string): string {
    return rol === 'Administrador' ? 'primary' : 'accent';
  }

  getRolIcon(rol: string): string {
    return rol === 'Administrador' ? 'admin_panel_settings' : 'person';
  }

  /**
   * 🎯 TRACKING FUNCTIONS
   */
  trackByMiembroId(index: number, miembro: MiembroGrupoSimpleDto): string {
    return miembro.idMiembro;
  }

  trackByActividadId(index: number, actividad: ActividadReciente): string {
    return actividad.id;
  }

  contarMiembrosPorRol(rol: string): number {
  if (!this.grupo || !this.grupo.miembros) {
    return 0;
  }
  return this.grupo.miembros.filter((miembro: any) => miembro.rol === rol).length;
}

  // ✅ MÉTODO CON TIPO EXPLÍCITO
  confirmarAccion(miembro: MiembroGrupoSimpleDto): void {
    console.log('Confirmar acción para miembro:', miembro);
  }
}