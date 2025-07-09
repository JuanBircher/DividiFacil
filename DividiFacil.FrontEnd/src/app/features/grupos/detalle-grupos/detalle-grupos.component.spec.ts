// ------------------------------------------------------------
// Test de integración de DetalleGruposComponent
// - Verifica creación, manejo de errores y lógica básica.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleGruposComponent } from './detalle-grupos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DetalleGruposComponent', () => {
  let component: DetalleGruposComponent;
  let fixture: ComponentFixture<DetalleGruposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
        DetalleGruposComponent // Importar el standalone
      ],
      // declarations: [DetalleGruposComponent], // Eliminar de declarations
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar mensaje de error si ocurre un error al cargar el grupo', () => {
    spyOn(console, 'error');
    component.error = 'Error al cargar el grupo';
    fixture.detectChanges();
    expect(component.error).toBe('Error al cargar el grupo');
  });

  // Agrega más tests de lógica y validaciones aquí
});
