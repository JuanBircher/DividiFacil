// ------------------------------------------------------------
// Test de integración de ListadoGastosComponent
// - Verifica que el componente se crea correctamente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoGastosComponent } from './listado.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListadoGastosComponent', () => {
  let component: ListadoGastosComponent;
  let fixture: ComponentFixture<ListadoGastosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListadoGastosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
