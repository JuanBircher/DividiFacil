// ------------------------------------------------------------
// Test de integración de AltaPagosComponent
// - Verifica creación y formulario inicializado.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaPagosComponent } from './alta-pagos.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { PagoService } from '../../../core/services/pago.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { AuthService } from '../../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AltaPagosComponent', () => {
  let component: AltaPagosComponent;
  let fixture: ComponentFixture<AltaPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AltaPagosComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AltaPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el formulario inicializado', () => {
    expect(component.pagoForm).toBeDefined();
  });

  let pagoServiceSpy: jasmine.SpyObj<any>;
  let grupoServiceSpy: jasmine.SpyObj<any>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<any>;
  let route: any;

  const mockUsuario = { idUsuario: 'u1', nombre: 'Juan', email: 'juan@test.com', fechaRegistro: '2024-01-01T00:00:00Z' };
  const mockGrupos = [
    { idGrupo: 'g1', nombreGrupo: 'Grupo 1', modoOperacion: 'Normal', idUsuarioCreador: 'u1', nombreCreador: 'Juan', fechaCreacion: '2024-01-01', descripcion: '', cantidadMiembros: 2, totalGastos: 1 }
  ];
  const mockMiembros = [
    { idMiembro: 'm1', idUsuario: 'u2', idGrupo: 'g1', nombre: 'Ana', email: 'ana@test.com', rol: 'Miembro', fechaUnion: '2024-01-01' }
  ];

  beforeEach(async () => {
    pagoServiceSpy = jasmine.createSpyObj('PagoService', ['crearPago']);
    grupoServiceSpy = jasmine.createSpyObj('GrupoService', ['getGrupos', 'obtenerMiembros']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    route = { queryParams: of({ idGrupo: 'g1' }) };

    await TestBed.configureTestingModule({
      imports: [
        AltaPagosComponent,
        ReactiveFormsModule,
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
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AltaPagosComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario y cargar grupos', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(of({ exito: true, data: { miembros: mockMiembros } }));
    fixture.detectChanges();
    expect(component.pagoForm).toBeDefined();
    expect(component.gruposDisponibles.length).toBe(1);
    expect(component.pagoForm.get('idGrupo')?.value).toBe('g1');
  });

  it('debería mostrar error si falla la carga de grupos', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(throwError(() => 'error'));
    fixture.detectChanges();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar grupos', 'Cerrar', { duration: 3000 });
    expect(component.loading).toBeFalse();
  });

  it('debería cargar miembros al seleccionar grupo', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(of({ exito: true, data: { miembros: mockMiembros } }));
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.onGrupoSeleccionado();
    expect(component.miembrosGrupo.length).toBe(1);
  });

  it('debería mostrar error si falla la carga de miembros', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(throwError(() => 'error'));
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.onGrupoSeleccionado();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al cargar miembros del grupo', 'Cerrar', { duration: 3000 });
  });

  it('debería validar el formulario y mostrar errores', () => {
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('');
    component.pagoForm.get('idReceptor')?.setValue('');
    component.pagoForm.get('monto')?.setValue('');
    component.pagoForm.get('concepto')?.setValue('');
    expect(component.pagoForm.valid).toBeFalse();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.pagoForm.get('idReceptor')?.setValue('u2');
    component.pagoForm.get('monto')?.setValue(0.005);
    component.pagoForm.get('concepto')?.setValue('ab');
    expect(component.pagoForm.valid).toBeFalse();
    component.pagoForm.get('monto')?.setValue(10);
    component.pagoForm.get('concepto')?.setValue('Pago válido');
    expect(component.pagoForm.valid).toBeTrue();
  });

  it('debería crear pago correctamente', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(of({ exito: true, data: { miembros: mockMiembros } }));
    pagoServiceSpy.crearPago.and.returnValue(of({ exito: true }));
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.pagoForm.get('idReceptor')?.setValue('u2');
    component.pagoForm.get('monto')?.setValue(100);
    component.pagoForm.get('concepto')?.setValue('Pago test');
    component.crearPago();
    expect(pagoServiceSpy.crearPago).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('¡Pago creado exitosamente!', 'Cerrar', { duration: 3000, panelClass: ['success-snackbar'] });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/listado-pagos'], { queryParams: { idGrupo: 'g1' } });
  });

  it('debería mostrar error si crear pago falla (exito false)', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(of({ exito: true, data: { miembros: mockMiembros } }));
    pagoServiceSpy.crearPago.and.returnValue(of({ exito: false }));
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.pagoForm.get('idReceptor')?.setValue('u2');
    component.pagoForm.get('monto')?.setValue(100);
    component.pagoForm.get('concepto')?.setValue('Pago test');
    component.crearPago();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al crear pago', 'Cerrar', { duration: 3000 });
  });

  it('debería mostrar error si crear pago lanza error http', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    grupoServiceSpy.getGrupos.and.returnValue(of({ exito: true, data: mockGrupos }));
    grupoServiceSpy.obtenerMiembros.and.returnValue(of({ exito: true, data: { miembros: mockMiembros } }));
    pagoServiceSpy.crearPago.and.returnValue(throwError(() => 'error'));
    fixture.detectChanges();
    component.pagoForm.get('idGrupo')?.setValue('g1');
    component.pagoForm.get('idReceptor')?.setValue('u2');
    component.pagoForm.get('monto')?.setValue(100);
    component.pagoForm.get('concepto')?.setValue('Pago test');
    component.crearPago();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Error al crear pago', 'Cerrar', { duration: 3000 });
  });

  it('debería navegar correctamente al cancelar', () => {
    component.idGrupoPreseleccionado = 'g1';
    component.cancelar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/listado-pagos'], { queryParams: { idGrupo: 'g1' } });
    component.idGrupoPreseleccionado = '';
    component.cancelar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/listado-pagos']);
  });

  it('debería exponer correctamente los métodos de nombre', () => {
    component.gruposDisponibles = mockGrupos;
    component.miembrosGrupo = mockMiembros;
    expect(component.obtenerNombreGrupo('g1')).toBe('Grupo 1');
    expect(component.obtenerNombreGrupo('g2')).toBe('');
    expect(component.obtenerNombreMiembro('u2')).toBe('Ana');
    expect(component.obtenerNombreMiembro('u3')).toBe('');
  });
});
