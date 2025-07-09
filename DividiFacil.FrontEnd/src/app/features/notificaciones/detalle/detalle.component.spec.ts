import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DetalleComponent } from './detalle.component';

// ------------------------------------------------------------
// Test de integración de DetalleComponent (Notificaciones)
// - Verifica creación básica del componente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

describe('DetalleComponent', () => {
  let component: DetalleComponent;
  let fixture: ComponentFixture<DetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {
            snapshot: {
              paramMap: { get: (key: string) => null },
              queryParamMap: { get: (key: string) => key === 'id' ? '1' : null }
            },
            paramMap: of({ get: (key: string) => key === 'id' ? '1' : null })
        } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
