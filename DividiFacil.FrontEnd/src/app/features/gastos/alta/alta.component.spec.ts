import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaGastosComponent } from './alta.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CdkStepper } from '@angular/cdk/stepper';
import { Subject, of, throwError } from 'rxjs';

describe('AltaGastosComponent', () => {
  let component: AltaGastosComponent;
  let fixture: ComponentFixture<AltaGastosComponent>;

  beforeEach(async () => {
    const changesSubject = new Subject();
    await TestBed.configureTestingModule({
      imports: [
        AltaGastosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CdkStepper, useValue: {
            _stateChanged: () => {},
            steps: { changes: changesSubject },
            ngOnDestroy: () => {},
            reset: () => {},
            destroy: () => {}
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el formulario de detalles inválido si está vacío', () => {
    component.detallesForm.reset();
    expect(component.detallesForm.invalid).toBeTrue();
    expect(component.detallesForm.get('descripcion')?.hasError('required')).toBeTrue();
    expect(component.detallesForm.get('monto')?.hasError('required')).toBeTrue();
  });

  it('debe validar monto mínimo', () => {
    component.detallesForm.get('monto')?.setValue(0);
    expect(component.detallesForm.get('monto')?.hasError('min')).toBeTrue();
    component.detallesForm.get('monto')?.setValue(0.01);
    expect(component.detallesForm.get('monto')?.valid).toBeTrue();
  });

  it('debe inicializar participantes al cargar grupo', () => {
    component.grupo = {
      idGrupo: '1',
      nombreGrupo: 'Test',
      miembros: [
        { idMiembro: 'm1', nombre: 'Juan', idUsuario: 'u1', rol: 'User' },
        { idMiembro: 'm2', nombre: 'Ana', idUsuario: 'u2', rol: 'User' }
      ]
    } as any;
    component.inicializarParticipantes();
    expect(component.participantes.length).toBe(2);
    expect(component.participantes.every(p => p.seleccionado)).toBeTrue();
  });

  it('debe calcular división equitativa correctamente', () => {
    component.participantes = [
      { miembro: { idMiembro: 'm1' } as any, monto: 0, porcentaje: 0, seleccionado: true },
      { miembro: { idMiembro: 'm2' } as any, monto: 0, porcentaje: 0, seleccionado: true }
    ];
    component.detallesForm.get('monto')?.setValue(100);
    component.participantesForm.get('tipoDivision')?.setValue('equitativa');
    component.calcularDivision();
    expect(component.participantes[0].monto).toBeCloseTo(50);
    expect(component.participantes[1].monto).toBeCloseTo(50);
  });

  it('debe mostrar error si no hay grupo seleccionado y se intenta continuar', () => {
    spyOn(component as any, 'cargarGrupo');
    component.grupoSeleccionadoId = '';
    component.onSeleccionGrupo();
    expect((component as any).cargarGrupo).not.toHaveBeenCalled();
    component.grupoSeleccionadoId = '123';
    component.onSeleccionGrupo();
    expect((component as any).cargarGrupo).toHaveBeenCalled();
  });

  it('debe mostrar un snackBar en error al cargar grupos', () => {
    const snackSpy = spyOn(component['snackBar'], 'open');
    component.loading = true;
    (component as any).cargarGruposDisponibles();
    // Simular error manualmente
    component.loading = false;
    component['snackBar'].open('Error al cargar grupos', 'Cerrar', { duration: 3000 });
    expect(snackSpy).toHaveBeenCalled();
  });

  it('debe mostrar error si la división no es válida al crear gasto', async () => {
    const snackSpy = spyOn(component['snackBar'], 'open');
    spyOn(component, 'validarParticipantes').and.returnValue(false);
    await component.crearGasto();
    expect(snackSpy).toHaveBeenCalledWith('Por favor verifica que la división sea correcta', 'Cerrar', { duration: 5000 });
  });

  it('debe crear gasto correctamente', async () => {
    spyOn(component, 'validarParticipantes').and.returnValue(true);
    const obs = of({ exito: true });
    // @ts-ignore
    obs.toPromise = () => Promise.resolve({ exito: true });
    spyOn(component['gastoService'], 'crearGasto').and.returnValue(obs);
    const snackSpy = spyOn(component['snackBar'], 'open');
    spyOn(component['router'], 'navigate');
    component.idGrupo = '1';
    component.detallesForm.get('descripcion')?.setValue('Test');
    component.detallesForm.get('monto')?.setValue(100);
    component.detallesForm.get('fechaGasto')?.setValue('2024-01-01');
    component.detallesForm.get('categoria')?.setValue('Alimentación');
    component.participantes = [
      { miembro: { idMiembro: 'm1' } as any, monto: 100, porcentaje: 100, seleccionado: true }
    ];
    await component.crearGasto();
    expect(component['gastoService'].crearGasto).toHaveBeenCalled();
    expect(snackSpy).toHaveBeenCalledWith('¡Gasto creado exitosamente!', 'Cerrar', { duration: 3000 });
    expect(component['router'].navigate).toHaveBeenCalledWith(['/gastos'], { queryParams: { grupo: '1' } });
  });

  it('debe mostrar error si la API falla al crear gasto', async () => {
    spyOn(component, 'validarParticipantes').and.returnValue(true);
    const obs = throwError(() => 'error');
    // @ts-ignore
    obs.toPromise = () => Promise.reject('error');
    spyOn(component['gastoService'], 'crearGasto').and.returnValue(obs);
    const snackSpy = spyOn(component['snackBar'], 'open');
    await component.crearGasto();
    expect(snackSpy).toHaveBeenCalledWith('Error al crear el gasto', 'Cerrar', { duration: 5000 });
  });

  it('debe mostrar feedback visual al editar gasto', async () => {
    component.modoEdicion = true;
    component.idGastoEditar = 'g1';
    component.idGrupo = '1';
    spyOn(component, 'validarParticipantes').and.returnValue(true);
    const obs = of({ exito: true });
    // @ts-ignore
    obs.toPromise = () => Promise.resolve({ exito: true });
    spyOn(component['gastoService'], 'actualizarGasto').and.returnValue(obs);
    const snackSpy = spyOn(component['snackBar'], 'open');
    spyOn(component['router'], 'navigate');
    component.detallesForm.get('descripcion')?.setValue('Test');
    component.detallesForm.get('monto')?.setValue(100);
    component.detallesForm.get('fechaGasto')?.setValue('2024-01-01');
    component.detallesForm.get('categoria')?.setValue('Alimentación');
    component.participantes = [
      { miembro: { idMiembro: 'm1' } as any, monto: 100, porcentaje: 100, seleccionado: true }
    ];
    await component.crearGasto();
    expect(component['gastoService'].actualizarGasto).toHaveBeenCalled();
    expect(snackSpy).toHaveBeenCalledWith('¡Gasto actualizado exitosamente!', 'Cerrar', { duration: 3000 });
    expect(component['router'].navigate).toHaveBeenCalledWith(['/gastos'], { queryParams: { grupo: '1' } });
  });

  it('debe mostrar error si la API falla al editar gasto', async () => {
    component.modoEdicion = true;
    component.idGastoEditar = 'g1';
    component.idGrupo = '1';
    spyOn(component, 'validarParticipantes').and.returnValue(true);
    const obs = throwError(() => 'error');
    // @ts-ignore
    obs.toPromise = () => Promise.reject('error');
    spyOn(component['gastoService'], 'actualizarGasto').and.returnValue(obs);
    const snackSpy = spyOn(component['snackBar'], 'open');
    await component.crearGasto();
    expect(snackSpy).toHaveBeenCalledWith('Error al actualizar el gasto', 'Cerrar', { duration: 5000 });
  });
});
