// ------------------------------------------------------------
// Test de integración de DetalleGastoComponent
// - Verifica creación básica del componente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleGastoComponent } from './detalle-gasto.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('DetalleGastoComponent', () => {
  let component: DetalleGastoComponent;
  let fixture: ComponentFixture<DetalleGastoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetalleGastoComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
