// ------------------------------------------------------------
// Test de integración de ListadoPagosComponent
// - Verifica creación básica del componente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoPagosComponent } from './listado-pagos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

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

  // Agrega más tests de lógica y validaciones aquí
});
