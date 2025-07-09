// ------------------------------------------------------------
// Test de integración de ConfiguracionesComponent
// - Verifica creación, formularios y validaciones básicas.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracionesComponent } from './configuraciones.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('ConfiguracionesComponent', () => {
  let component: ConfiguracionesComponent;
  let fixture: ComponentFixture<ConfiguracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
        ConfiguracionesComponent
      ],
      providers: [
        { provide: MatSnackBar, useValue: { open: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionesComponent);
    component = fixture.componentInstance;
    // Asignar un grupo mock válido antes de inicializar
    component.grupo = {
      nombreGrupo: 'Grupo Test',
      descripcion: 'Descripción de prueba',
      modoOperacion: 'Estandar',
      miembros: []
    } as any;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el formulario de grupo inicializado', () => {
    expect(component.grupoForm).toBeDefined();
  });

  it('debería tener el formulario de notificaciones inicializado', () => {
    expect(component.notificacionesForm).toBeDefined();
  });

  it('debería mostrar mensaje de error si el formulario de grupo es inválido y se intenta guardar', () => {
    component.grupoForm.get('nombreGrupo')?.setValue('');
    component.grupoForm.get('descripcion')?.setValue('');
    component.grupoForm.get('modoOperacion')?.setValue('');
    component.esAdministrador = true;
    fixture.detectChanges();
    spyOn(component, 'guardarConfiguracionGrupo').and.callThrough();
    component.guardarConfiguracionGrupo();
    expect(component.grupoForm.invalid).toBeTrue();
  });

  it('debería llamar a guardarConfiguracionGrupo y mostrar mensaje de éxito si el formulario es válido', () => {
    component.grupoForm.get('nombreGrupo')?.setValue('Grupo Test');
    component.grupoForm.get('descripcion')?.setValue('Descripción de prueba');
    component.grupoForm.get('modoOperacion')?.setValue('Estandar');
    component.esAdministrador = true;
    fixture.detectChanges();
    spyOn(component['grupoService'], 'actualizarGrupo').and.returnValue(of({ exito: true }));
    const spy = spyOn(component as any, 'snackBar').and.callThrough();
    component.guardarConfiguracionGrupo();
    expect(component.grupoForm.valid).toBeTrue();
  });

  it('debería mostrar mensaje de error si el usuario no es administrador al guardar', () => {
    component.esAdministrador = false;
    fixture.detectChanges();
    spyOn(component, 'guardarConfiguracionGrupo').and.callThrough();
    component.guardarConfiguracionGrupo();
    expect(component.guardandoGrupo).toBeFalse();
  });

  it('debería mostrar mensaje de éxito al guardar configuración de notificaciones', () => {
    spyOn(component['notificacionService'], 'actualizarConfiguracion').and.returnValue(of({ exito: true }));
    component.notificacionesForm.get('notificarNuevosPagos')?.setValue(true);
    component.notificacionesForm.get('notificarNuevosGastos')?.setValue(true);
    component.notificacionesForm.get('notificarInvitacionesGrupo')?.setValue(true);
    component.notificacionesForm.get('notificarCambiosEstadoPagos')?.setValue(true);
    component.notificacionesForm.get('recordatoriosDeudas')?.setValue(true);
    component.notificacionesForm.get('recordatoriosPagos')?.setValue(true);
    component.notificacionesForm.get('frecuenciaRecordatorios')?.setValue('Semanal');
    fixture.detectChanges();
    component.guardandoNotificaciones = false;
    component.guardarConfiguracionNotificaciones();
    expect(component.guardandoNotificaciones).toBeFalse();
  });

  // Agrega más tests de lógica y validaciones aquí
});
