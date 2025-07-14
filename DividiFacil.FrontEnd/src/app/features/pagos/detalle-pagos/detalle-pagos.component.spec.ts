// ------------------------------------------------------------
// Test de integración de DetallePagosComponent
// - Verifica creación básica del componente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePagosComponent } from './detalle-pagos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { PagoService } from '../../../core/services/pago.service';
import { AuthService } from '../../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('DetallePagosComponent', () => {
  let component: DetallePagosComponent;
  let fixture: ComponentFixture<DetallePagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetallePagosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  let pagoServiceSpy: jasmine.SpyObj<any>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<any>;
  let route: any;

  const mockPago = {
    idPago: 'p1',
    idGrupo: 'g1',
    idPagador: 'u1',
    idReceptor: 'u2',
    monto: 100,
    concepto: 'Test pago',
    estado: 'Pendiente' as 'Pendiente',
    fechaCreacion: '2024-01-01T00:00:00Z',
    nombrePagador: 'Juan',
    nombreReceptor: 'Ana'
  };
  const mockUsuario = {
    idUsuario: 'u2',
    nombre: 'Ana',
    email: 'ana@test.com',
    fechaRegistro: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    pagoServiceSpy = jasmine.createSpyObj('PagoService', ['obtenerPago', 'confirmarPago', 'rechazarPago']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    route = { params: of({ id: 'p1' }) };

    await TestBed.configureTestingModule({
      imports: [
        DetallePagosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PagoService, useValue: pagoServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePagosComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería cargar el pago correctamente', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(of({ exito: true, data: mockPago }));
    fixture.detectChanges();
    expect(component.pago).toEqual(mockPago);
    expect(component.loading).toBeFalse();
    expect(component.usuarioActual).toEqual(mockUsuario);
    // Feedback visual: debería mostrar datos en el template
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test pago');
    expect(compiled.textContent).toContain('Juan');
    expect(compiled.textContent).toContain('Ana');
  });

  it('debería manejar error al cargar el pago', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(of({ exito: false, data: undefined }));
    fixture.detectChanges();
    expect(component.pago).toBeUndefined();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Pago no encontrado', 'Cerrar', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pagos']);
  });

  it('debería navegar a login si no hay usuario autenticado', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(undefined);
    pagoServiceSpy.obtenerPago.and.returnValue(of({ exito: true, data: mockPago }));
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería manejar error http al cargar el pago', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    pagoServiceSpy.obtenerPago.and.returnValue(throwError(() => 'error'));
    fixture.detectChanges();
    expect(component.pago).toBeUndefined();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar pago', 'Cerrar', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pagos']);
  });

  it('debería confirmar el pago correctamente', () => {
    component.pago = { ...mockPago };
    component.usuarioActual = mockUsuario;
    pagoServiceSpy.confirmarPago.and.returnValue(of({ exito: true }));
    spyOn(component, 'cargarPago');
    component.confirmarPago();
    expect(pagoServiceSpy.confirmarPago).toHaveBeenCalledWith('p1');
    expect(snackBarSpy.open).toHaveBeenCalledWith('¡Pago confirmado exitosamente!', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
    expect(component.cargarPago).toHaveBeenCalled();
    // Feedback visual: debería mostrar el estado actualizado si el método lo hace
    // expect(component.pago.estado).toBe('Completado');
  });

  it('debería mostrar error si confirmar pago falla', () => {
    component.pago = { ...mockPago };
    component.usuarioActual = mockUsuario;
    pagoServiceSpy.confirmarPago.and.returnValue(throwError(() => 'error'));
    component.confirmarPago();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al confirmar pago', 'Cerrar', { duration: 3000 });
    // El estado del pago no debe cambiar
    expect(component.pago.estado).toBe('Pendiente');
  });

  it('debería rechazar el pago correctamente', () => {
    component.pago = { ...mockPago };
    component.usuarioActual = mockUsuario;
    pagoServiceSpy.rechazarPago.and.returnValue(of({ exito: true }));
    spyOn(window, 'prompt').and.returnValue('Motivo de prueba');
    spyOn(component, 'cargarPago');
    component.rechazarPago();
    expect(pagoServiceSpy.rechazarPago).toHaveBeenCalledWith('p1', 'Motivo de prueba');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Pago rechazado', 'Cerrar', { duration: 3000 });
    expect(component.cargarPago).toHaveBeenCalled();
    // Feedback visual: debería mostrar el estado actualizado si el método lo hace
    // expect(component.pago.estado).toBe('Rechazado');
  });
  it('debería no rechazar el pago si el usuario cancela el prompt', () => {
    component.pago = { ...mockPago };
    component.usuarioActual = mockUsuario;
    spyOn(window, 'prompt').and.returnValue(null);
    spyOn(component, 'cargarPago');
    component.rechazarPago();
    expect(pagoServiceSpy.rechazarPago).not.toHaveBeenCalled();
    expect(component.cargarPago).not.toHaveBeenCalled();
  });
  it('debería exponer el método volver correctamente', () => {
    spyOn(routerSpy, 'navigate');
    component.volver();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pagos']);
  });

  it('debería mostrar error si rechazar pago falla', () => {
    component.pago = { ...mockPago };
    component.usuarioActual = mockUsuario;
    pagoServiceSpy.rechazarPago.and.returnValue(throwError(() => 'error'));
    spyOn(window, 'prompt').and.returnValue('Motivo de prueba');
    component.rechazarPago();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al rechazar pago', 'Cerrar', { duration: 3000 });
    // El estado del pago no debe cambiar
    expect(component.pago.estado).toBe('Pendiente');
  });

  it('debería exponer correctamente los métodos de estado', () => {
    expect(component.obtenerColorEstado('Pendiente')).toBe('warn');
    expect(component.obtenerColorEstado('Completado')).toBe('primary');
    expect(component.obtenerColorEstado('Rechazado')).toBe('accent');
    expect(component.obtenerIconoEstado('Pendiente')).toBe('schedule');
    expect(component.obtenerIconoEstado('Completado')).toBe('check_circle');
    expect(component.obtenerIconoEstado('Rechazado')).toBe('cancel');
    expect(component.obtenerIconoEstado('Otro' as any)).toBe('help');
  });
});
