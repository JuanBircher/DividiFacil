import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { GastoService } from '../../../core/services/gasto.service';
import { AuthService } from '../../../core/auth.service';
import { GastoDto, DetalleGastoDto } from '../../../core/models/gasto.model';

interface EstadoParticipante {
    detalle: DetalleGastoDto;
    puedeMarcarPagado: boolean;
    puedeConfirmar: boolean;
    estadoTexto: string;
    colorEstado: string;
    iconoEstado: string;
}

@Component({
    selector: 'app-detalle-gasto',
    standalone: true,
    templateUrl: './detalle.component.html',
    styleUrls: ['./detalle.component.scss'],
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatTabsModule,
        MatDividerModule,
        RouterModule
    ]
})
export class DetalleGastoComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Datos principales
    gasto: GastoDto | null = null;
    participantes: EstadoParticipante[] = [];
    idGasto: string = '';
    usuarioActual: string = '';

    // Estados de UI
    loading = false;
    procesandoPago = false;
    error: string | null = null;

    // Resumen financiero
    totalPagado = 0;
    totalPendiente = 0;
    participantesPagados = 0;
    participantesPendientes = 0;

    constructor(
        private gastoService: GastoService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.idGasto = params['id'];
                if (this.idGasto) {
                    this.obtenerUsuarioActual();
                    this.cargarDetalleGasto();
                } else {
                    this.router.navigate(['/gastos']);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * 👤 OBTENER USUARIO ACTUAL
     */
    private obtenerUsuarioActual(): void {
        const usuario = this.authService.obtenerUsuario();
        this.usuarioActual = usuario?.nombreUsuario || '';
    }

    /**
     * 📋 CARGAR DETALLE COMPLETO DEL GASTO
     */
    cargarDetalleGasto(): void {
        this.loading = true;
        this.error = null;

        this.gastoService.obtenerGasto(this.idGasto)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    if (response.exito && response.data) {
                        this.gasto = response.data;
                        this.procesarParticipantes();
                        this.calcularResumen();
                    } else {
                        this.error = 'No se pudo cargar el detalle del gasto';
                        this.snackBar.open('Error al cargar el gasto', 'Cerrar', { duration: 3000 });
                    }
                },
                error: (err) => {
                    this.loading = false;
                    this.error = 'Error al cargar el gasto';
                    console.error('Error al cargar gasto:', err);
                    this.snackBar.open('Error al cargar el gasto', 'Cerrar', { duration: 3000 });
                }
            });
    }

    /**
     * 👥 PROCESAR PARTICIPANTES Y SUS ESTADOS
     */
    private procesarParticipantes(): void {
        if (!this.gasto?.detalles) {
            this.participantes = [];
            return;
        }

        this.participantes = this.gasto.detalles.map(detalle => {
            const esUsuarioActual = detalle.nombreMiembroDeudor === this.usuarioActual;
            const esPagador = this.gasto!.nombreMiembroPagador === this.usuarioActual;

            return {
                detalle,
                puedeMarcarPagado: esUsuarioActual && !detalle.pagado,
                puedeConfirmar: esPagador && detalle.pagado,
                estadoTexto: this.obtenerEstadoTexto(detalle.pagado),
                colorEstado: this.obtenerColorEstado(detalle.pagado),
                iconoEstado: this.obtenerIconoEstado(detalle.pagado)
            };
        });
    }

    /**
     * 📊 CALCULAR RESUMEN FINANCIERO
     */
    private calcularResumen(): void {
        if (!this.gasto?.detalles) return;

        this.totalPagado = 0;
        this.totalPendiente = 0;
        this.participantesPagados = 0;
        this.participantesPendientes = 0;

        this.gasto.detalles.forEach(detalle => {
            if (detalle.pagado) {
                this.totalPagado += detalle.monto;
                this.participantesPagados++;
            } else {
                this.totalPendiente += detalle.monto;
                this.participantesPendientes++;
            }
        });
    }

    /**
     * 💰 MARCAR DETALLE COMO PAGADO
     */
    async marcarComoPagado(participante: EstadoParticipante): Promise<void> {
        if (!participante.puedeMarcarPagado || this.procesandoPago) return;

        this.procesandoPago = true;

        try {
            await this.gastoService.marcarComoPagado(
                this.idGasto,
                participante.detalle.idDetalleGasto
            ).toPromise();

            this.snackBar.open('Pago marcado exitosamente', 'Cerrar', { duration: 3000 });

            // Recargar datos
            this.cargarDetalleGasto();

        } catch (error) {
            console.error('Error al marcar como pagado:', error);
            this.snackBar.open('Error al marcar el pago', 'Cerrar', { duration: 3000 });
        } finally {
            this.procesandoPago = false;
        }
    }

    /**
     * ✏️ EDITAR GASTO
     */
    editarGasto(): void {
        this.router.navigate(['/gastos/editar', this.idGasto], {
            queryParams: { grupo: this.obtenerIdGrupo() }
        });
    }

    /**
     * 🗑️ ELIMINAR GASTO
     */
    async eliminarGasto(): Promise<void> {
        if (!this.gasto) return;

        if (!confirm(`¿Estás seguro de eliminar el gasto "${this.gasto.descripcion}"?`)) {
            return;
        }

        try {
            await this.gastoService.eliminarGasto(this.idGasto).toPromise();

            this.snackBar.open('Gasto eliminado exitosamente', 'Cerrar', { duration: 3000 });

            // Navegar de vuelta al listado
            this.volverAlListado();

        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            this.snackBar.open('Error al eliminar el gasto', 'Cerrar', { duration: 3000 });
        }
    }

    /**
     * 🔙 VOLVER AL LISTADO
     */
    volverAlListado(): void {
        this.router.navigate(['/gastos'], {
            queryParams: { grupo: this.obtenerIdGrupo() }
        });
    }

    /**
     * 🆔 OBTENER ID DEL GRUPO (desde query params o gasto)
     */
    private obtenerIdGrupo(): string {
        // Intentar obtener desde query params primero
        const grupoParam = this.route.snapshot.queryParams['grupo'];
        if (grupoParam) return grupoParam;

        // Si no, extraer del gasto (requiere implementación backend)
        return '';
    }

    /**
     * 🎨 OBTENER TEXTO DEL ESTADO
     */
    private obtenerEstadoTexto(pagado: boolean): string {
        return pagado ? 'Pagado' : 'Pendiente';
    }

    /**
     * 🎨 OBTENER COLOR DEL ESTADO
     */
    private obtenerColorEstado(pagado: boolean): string {
        return pagado ? 'success' : 'warning';
    }

    /**
     * 🎨 OBTENER ICONO DEL ESTADO
     */
    private obtenerIconoEstado(pagado: boolean): string {
        return pagado ? 'check_circle' : 'pending';
    }

    /**
     * 🎨 OBTENER ICONO DE CATEGORÍA
     */
    obtenerIconoCategoria(categoria?: string): string {
        if (!categoria) return 'receipt';

        const iconos: { [key: string]: string } = {
            'Alimentación': 'restaurant',
            'Transporte': 'directions_car',
            'Entretenimiento': 'local_activity',
            'Servicios': 'build',
            'Compras': 'shopping_cart',
            'Salud': 'local_hospital',
            'Viajes': 'flight',
            'Otros': 'category'
        };

        return iconos[categoria] || 'receipt';
    }

    /**
     * 👮 VERIFICAR SI ES PAGADOR
     */
    esPagador(): boolean {
        return this.gasto?.nombreMiembroPagador === this.usuarioActual;
    }


    /**
     * 📈 OBTENER PORCENTAJE DE PROGRESO
     */
    obtenerPorcentajePagado(): number {
        if (!this.gasto?.monto || this.gasto.monto === 0) return 0;
        return Math.round((this.totalPagado / this.gasto.monto) * 100);
    }

    /**
   * 🔄 TRACK BY PARA OPTIMIZAR PERFORMANCE
   */
    trackByParticipante(index: number, participante: EstadoParticipante): string {
        return participante.detalle.idDetalleGasto;
    }

    // Exponer Math para el template
    Math = Math;
}