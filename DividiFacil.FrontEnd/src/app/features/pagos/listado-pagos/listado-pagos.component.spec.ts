
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoPagosComponent } from './listado-pagos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PagoService } from '../../../core/services/pago.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { AuthService } from '../../../core/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

describe('ListadoPagosComponent', () => {
  let component: ListadoPagosComponent;
  let fixture: ComponentFixture<ListadoPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListadoPagosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  let pagoServiceSpy: jasmine.SpyObj<any>;
  let grupoServiceSpy: jasmine.SpyObj<any>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<any>;
  let usuarioServiceSpy: jasmine.SpyObj<any>;
  let cdrSpy: jasmine.SpyObj<any>;
  let route: any;

  const mockUsuario = { idUsuario: 'u1', nombre: 'Juan', email: 'juan@test.com', fechaRegistro: '2024-01-01T00:00:00Z' };
  const mockPagos = [
    { idPago: 'p1', idGrupo: 'g1', idPagador: 'u1', idReceptor: 'u2', monto: 100, concepto: 'Pago 1', estado: 'Pendiente' as 'Pendiente', fechaCreacion: '2024-01-01T00:00:00Z' },
    { idPago: 'p2', idGrupo: 'g1', idPagador: 'u2', idReceptor: 'u1', monto: 200, concepto: 'Pago 2', estado: 'Completado' as 'Completado', fechaCreacion: '2024-01-02T00:00:00Z' }
  ];
  const mockGrupos = [
    { idGrupo: 'g1', nombreGrupo: 'Grupo 1', modoOperacion: 'Normal', idUsuarioCreador: 'u1', nombreCreador: 'Juan', fechaCreacion: '2024-01-01', descripcion: '', cantidadMiembros: 2, totalGastos: 1 }
  ];

  beforeEach(async () => {
    pagoServiceSpy = jasmine.createSpyObj('PagoService', ['obtenerPago', 'confirmarPago', 'rechazarPago']);
    grupoServiceSpy = jasmine.createSpyObj('GrupoService', ['getGrupos']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['getUsuarioPorId']);
    cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    route = { queryParams: of({}) };

    await TestBed.configureTestingModule({
      imports: [
        ListadoPagosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PagoService, useValue: pagoServiceSpy },
        { provide: GrupoService, useValue: grupoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: 'ChangeDetectorRef', useValue: cdrSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoPagosComponent);
    component = fixture.componentInstance;
    // No se debe acceder a cdr privada, los tests funcionarán igual sin esto
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería cargar pagos correctamente', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(of({ exito: true, data: mockPagos }));
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    fixture.detectChanges();
    expect(component.todosLosPagos.length).toBe(2);
    expect(component.pagosRealizados.length).toBe(1);
    expect(component.pagosRecibidos.length).toBe(1);
    expect(component.error).toBeNull();
  });

  it('debería manejar error al cargar pagos', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(of({ exito: false, data: undefined, mensaje: 'Error' }));
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    fixture.detectChanges();
    expect(component.todosLosPagos.length).toBe(0);
    expect(component.error).toBe('Error');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error', 'Cerrar', { duration: 3000 });
  });

  it('debería manejar error http al cargar pagos', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(throwError(() => 'error'));
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    fixture.detectChanges();
    expect(component.todosLosPagos.length).toBe(0);
    expect(component.error).toBe('Error al cargar pagos. Intenta nuevamente.');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar pagos. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
  });

  it('debería confirmar pago correctamente', () => {
    const pago = { ...mockPagos[0] };
    pagoServiceSpy.confirmarPago.and.returnValue(of({ exito: true }));
    component.usuarioActual = mockUsuario;
    // No se debe acceder a la propiedad privada cdr
    component.confirmarPago(pago);
    expect(pagoServiceSpy.confirmarPago).toHaveBeenCalledWith('p1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Pago confirmado exitosamente', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
  });

  it('debería mostrar error si confirmar pago falla', () => {
    const pago = { ...mockPagos[0] };
    pagoServiceSpy.confirmarPago.and.returnValue(throwError(() => 'error'));
    component.usuarioActual = mockUsuario;
    // No se debe acceder a la propiedad privada cdr
    component.confirmarPago(pago);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al confirmar pago', 'Cerrar', { duration: 3000 });
  });

  it('debería rechazar pago correctamente', () => {
    const pago = { ...mockPagos[0] };
    pagoServiceSpy.rechazarPago.and.returnValue(of({ exito: true }));
    component.usuarioActual = mockUsuario;
    // No se debe acceder a la propiedad privada cdr
    spyOn(component, 'cargarPagos');
    component.rechazarPago(pago);
    expect(pagoServiceSpy.rechazarPago).toHaveBeenCalledWith('p1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Pago rechazado', 'Cerrar', { duration: 3000, panelClass: ['warn-snackbar'] });
    expect(component.cargarPagos).toHaveBeenCalled();
  });

  it('debería mostrar error si rechazar pago falla', () => {
    const pago = { ...mockPagos[0] };
    pagoServiceSpy.rechazarPago.and.returnValue(throwError(() => 'error'));
    component.usuarioActual = mockUsuario;
    // No se debe acceder a la propiedad privada cdr
    component.rechazarPago(pago);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al rechazar pago', 'Cerrar', { duration: 3000 });
  });

  it('debería navegar a alta-pagos al crearPago()', () => {
    component.idGrupoPreseleccionado = 'g1';
    component.crearPago();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/alta-pagos'], { queryParams: { idGrupo: 'g1' } });
  });

  it('debería navegar al detalle de pago', () => {
    const pago = { ...mockPagos[0] };
    component.verDetallePago(pago);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/detalle-pagos', pago.idPago]);
  });
});
