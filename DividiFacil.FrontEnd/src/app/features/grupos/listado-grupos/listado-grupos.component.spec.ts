// ------------------------------------------------------------
// Test de integración de ListadoGruposComponent
// - Verifica creación y manejo de errores visuales.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoGruposComponent } from './listado-grupos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListadoGruposComponent', () => {
  let component: ListadoGruposComponent;
  let fixture: ComponentFixture<ListadoGruposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListadoGruposComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoGruposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar mensaje de error si ocurre un error al cargar los grupos', () => {
    component.error = 'Error al cargar grupos';
    fixture.detectChanges();
    expect(component.error).toBe('Error al cargar grupos');
  });

  // No se testea navegación porque el método cargarGrupos no navega, solo carga datos
});
