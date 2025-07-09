import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ListadoNotificacionesComponent  } from './listado.component';

// ------------------------------------------------------------
// Test de integración de ListadoNotificacionesComponent
// - Verifica que el componente se crea correctamente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

describe('ListadoNotificacionesComponent', () => {
  let component: ListadoNotificacionesComponent;
  let fixture: ComponentFixture<ListadoNotificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoNotificacionesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoNotificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
