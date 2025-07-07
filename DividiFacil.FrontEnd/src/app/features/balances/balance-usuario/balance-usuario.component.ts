import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';

// Services y Models
import { BalanceService } from '../../../core/services/balance.service';
import { BalanceUsuarioDto, DeudaDetalladaDto } from '../../../core/models/balance.model';
import { ResponseDto } from '../../../core/models/response.model';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-balance-usuario',
    standalone: true,
    templateUrl: './balance-usuario.component.html',
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatChipsModule,
        MatExpansionModule,
        MatBadgeModule,
        CurrencyFormatPipe,
        CardComponent,
        LoadingSpinnerComponent
    ]
})
export class BalanceUsuarioComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    // Estados
    loading = false;

    // Datos
    balanceUsuario: BalanceUsuarioDto | null = null;
    balanceUsuarios: BalanceUsuarioDto[] = [];
    idUsuario = '';
    idGrupo = '';

    // Configuración tabla
    displayedColumnsDeudas = ['gasto', 'fecha', 'monto', 'corresponde', 'pagado', 'pendiente', 'acciones'];

    constructor(
        private balanceService: BalanceService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.params
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.idUsuario = params['id'];
                this.idGrupo = this.route.snapshot.queryParams['idGrupo'];

                if (this.idUsuario && this.idGrupo) {
                    this.cargarBalanceUsuario();
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * 🔄 CARGAR BALANCE DEL USUARIO
     */
    cargarBalanceUsuario(): void {
        this.loading = true;
        this.balanceService.obtenerBalanceUsuario(this.idUsuario)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: ResponseDto<BalanceUsuarioDto[]>) => {
                    this.loading = false;
                    if (response.exito && response.data && Array.isArray(response.data)) {
                        this.balanceUsuarios = response.data;
                        // Si necesitas un solo usuario, puedes buscarlo por idUsuario
                        this.balanceUsuario = response.data.find((bu: BalanceUsuarioDto) => bu.idUsuario === this.idUsuario) || null;
                    } else {
                        this.snackBar.open('Error al cargar balance del usuario', 'Cerrar', { duration: 3000 });
                    }
                },
                error: (err: any) => {
                    this.loading = false;
                    console.error('Error al cargar balance:', err);
                    this.snackBar.open('Error al cargar balance del usuario', 'Cerrar', { duration: 3000 });
                }
            });
    }

    /**
     * 💰 CREAR PAGO DESDE DEUDA
     */
    crearPagoDesdeDeuda(deuda: DeudaDetalladaDto): void {
        this.router.navigate(['/alta-pagos'], {
            queryParams: {
                idGrupo: this.idGrupo,
                monto: deuda.monto,
                concepto: `Pago de deuda`
            }
        });
    }

    /**
     * 🔙 VOLVER AL BALANCE DEL GRUPO
     */
    volverAlBalanceGrupo(): void {
        this.router.navigate(['/balances/grupo', this.idGrupo]);
    }

    /**
     * 🎨 OBTENER COLOR BALANCE
     */
    obtenerColorBalance(balance: number): string {
        if (balance > 0) return 'primary';
        if (balance < 0) return 'warn';
        return 'accent';
    }

    /**
     * 🎨 OBTENER ESTADO BALANCE
     */
    obtenerEstadoBalance(balance: number): string {
        if (balance > 0) return 'A favor';
        if (balance < 0) return 'En deuda';
        return 'Equilibrado';
    }

    /**
     * 🔢 TRACKBY FUNCTION
     */
    trackByDeuda(index: number, item: DeudaDetalladaDto): string {
        return `${item.idUsuarioDeudor}-${item.idUsuarioAcreedor}`;
    }
}