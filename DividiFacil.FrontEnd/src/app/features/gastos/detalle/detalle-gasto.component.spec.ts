
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetalleGastoComponent } from './detalle-gasto.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GastoService } from '../../../core/services/gasto.service';
import { AuthService } from '../../../core/auth.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

describe('DetalleGastoComponent', () => {
  let component: DetalleGastoComponent;
  let fixture: ComponentFixture<DetalleGastoComponent>;
  let gastoServiceSpy: jasmine.SpyObj<GastoService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let router: Router;
  let route: ActivatedRoute;

  const mockGasto = {
    idGasto: '1',
    idGrupo: 'g1',
    nombreGrupo: 'Grupo Test',
    descripcion: 'Gasto Test',
    idMiembroPagador: 'user1',
    nombreMiembroPagador: 'Pagador',
    monto: 100,
    categoria: 'Alimentación',
    fechaCreacion: '2024-01-01T00:00:00Z',
    fechaGasto: '2024-01-01T00:00:00Z',
    detalles: [
      { idDetalleGasto: 'd1', idMiembroDeudor: 'user2', nombreMiembroDeudor: 'Deudor', monto: 50, pagado: false },
      { idDetalleGasto: 'd2', idMiembroDeudor: 'user3', nombreMiembroDeudor: 'Deudor2', monto: 50, pagado: true }
    ]
  };

  beforeEach(async () => {
    gastoServiceSpy = jasmine.createSpyObj('GastoService', ['obtenerGasto', 'marcarComoPagado', 'eliminarGasto']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        DetalleGastoComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: GastoService, useValue: gastoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { queryParams: { grupo: 'g1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleGastoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería cargar el detalle del gasto correctamente', fakeAsync(() => {
    const usuario = {
      idUsuario: 'user1',
      nombre: 'Test',
      email: 'test@test.com',
      fechaRegistro: '2024-01-01T00:00:00Z'
    };
    authServiceSpy.obtenerUsuario.and.returnValue(usuario);
    gastoServiceSpy.obtenerGasto.and.returnValue(of({ exito: true, data: mockGasto }));
    fixture.detectChanges();
    tick();
    expect(component.gasto).toEqual(mockGasto);
    expect(component.esParticipante).toBeTrue();
    expect(component.participantes.length).toBe(2);
    expect(component.totalPagado).toBe(50);
    expect(component.totalPendiente).toBe(50);
    expect(component.participantesPagados).toBe(1);
    expect(component.participantesPendientes).toBe(1);
  }));

  it('debería manejar error al cargar el gasto', fakeAsync(() => {
    const usuario = {
      idUsuario: 'user1',
      nombre: 'Test',
      email: 'test@test.com',
      fechaRegistro: '2024-01-01T00:00:00Z'
    };
    authServiceSpy.obtenerUsuario.and.returnValue(usuario);
    gastoServiceSpy.obtenerGasto.and.returnValue(of({ exito: false, mensaje: 'Error', data: undefined }));
    fixture.detectChanges();
    tick();
    expect(component.error).toBe('No se pudo cargar el detalle del gasto');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar el gasto', 'Cerrar', { duration: 3000 });
  }));

  it('debería manejar error http al cargar el gasto', fakeAsync(() => {
    const usuario = {
      idUsuario: 'user1',
      nombre: 'Test',
      email: 'test@test.com',
      fechaRegistro: '2024-01-01T00:00:00Z'
    };
    authServiceSpy.obtenerUsuario.and.returnValue(usuario);
    gastoServiceSpy.obtenerGasto.and.returnValue(throwError(() => new Error('Http error')));
    fixture.detectChanges();
    tick();
    expect(component.error).toBe('Error al cargar el gasto');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar el gasto', 'Cerrar', { duration: 3000 });
  }));

  it('debería marcar como pagado y recargar el detalle', fakeAsync(() => {
    component.gasto = mockGasto;
    gastoServiceSpy.marcarComoPagado.and.returnValue(of({ exito: true }));
    spyOn(component, 'cargarDetalleGasto');
    component.marcarComoPagado({
      detalle: mockGasto.detalles![0],
      puedeMarcarPagado: true,
      puedeConfirmar: false,
      estadoTexto: 'Pendiente',
      colorEstado: 'warning',
      iconoEstado: 'pending'
    });
    tick();
    expect(gastoServiceSpy.marcarComoPagado).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Pago confirmado exitosamente', 'Cerrar', { duration: 3000 });
    expect(component.cargarDetalleGasto).toHaveBeenCalled();
  }));

  it('debería mostrar error si marcar como pagado falla', fakeAsync(() => {
    component.gasto = mockGasto;
    gastoServiceSpy.marcarComoPagado.and.returnValue(of({ exito: false, mensaje: 'Error' }));
    component.marcarComoPagado({
      detalle: mockGasto.detalles![0],
      puedeMarcarPagado: true,
      puedeConfirmar: false,
      estadoTexto: 'Pendiente',
      colorEstado: 'warning',
      iconoEstado: 'pending'
    });
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error', 'Cerrar', { duration: 3000 });
  }));

  it('debería mostrar error http si marcar como pagado falla', fakeAsync(() => {
    component.gasto = mockGasto;
    gastoServiceSpy.marcarComoPagado.and.returnValue(throwError(() => new Error('Http error')));
    component.marcarComoPagado({
      detalle: mockGasto.detalles![0],
      puedeMarcarPagado: true,
      puedeConfirmar: false,
      estadoTexto: 'Pendiente',
      colorEstado: 'warning',
      iconoEstado: 'pending'
    });
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al confirmar pago', 'Cerrar', { duration: 3000 });
  }));

  it('debería navegar al editar gasto', () => {
    component.idGasto = '1';
    spyOn(router, 'navigate');
    component.editarGasto();
    expect(router.navigate).toHaveBeenCalledWith(['/gastos', '1', 'editar'], { queryParams: { grupo: 'g1' } });
  });

  it('debería navegar al listado al volver', () => {
    spyOn(router, 'navigate');
    component.gasto = mockGasto;
    component.volverAlListado();
    expect(router.navigate).toHaveBeenCalledWith(['/gastos'], { queryParams: { grupo: 'g1' } });
  });

  it('debería eliminar el gasto correctamente', fakeAsync(() => {
    component.gasto = mockGasto;
    spyOn(window, 'confirm').and.returnValue(true);
    gastoServiceSpy.eliminarGasto.and.returnValue(of({ exito: true }));
    spyOn(router, 'navigate');
    component.eliminarGasto();
    tick();
    expect(gastoServiceSpy.eliminarGasto).toHaveBeenCalledWith('1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Gasto eliminado correctamente', 'Cerrar', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/gastos'], { queryParams: { grupo: 'g1' } });
  }));

  it('debería mostrar error si eliminar gasto falla', fakeAsync(() => {
    component.gasto = mockGasto;
    spyOn(window, 'confirm').and.returnValue(true);
    gastoServiceSpy.eliminarGasto.and.returnValue(throwError(() => new Error('Http error')));
    component.eliminarGasto();
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al eliminar el gasto', 'Cerrar', { duration: 3000 });
  }));

  it('debería no eliminar si el usuario cancela confirmación', fakeAsync(() => {
    component.gasto = mockGasto;
    spyOn(window, 'confirm').and.returnValue(false);
    component.eliminarGasto();
    expect(gastoServiceSpy.eliminarGasto).not.toHaveBeenCalled();
  }));

  it('debería exponer correctamente el método obtenerIconoCategoria', () => {
    expect(component.obtenerIconoCategoria('Alimentación')).toBe('restaurant');
    expect(component.obtenerIconoCategoria('Desconocida')).toBe('receipt');
  });

  it('debería calcular porcentaje pagado correctamente', () => {
    component.gasto = { ...mockGasto, monto: 100 };
    component.totalPagado = 50;
    expect(component.obtenerPorcentajePagado()).toBe(50);
    component.gasto.monto = 0;
    expect(component.obtenerPorcentajePagado()).toBe(0);
  });
});
