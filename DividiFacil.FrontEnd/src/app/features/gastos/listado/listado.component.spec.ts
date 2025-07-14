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

  it('debe inicializar el formulario de filtros correctamente', () => {
    expect(component.filtrosForm).toBeDefined();
    expect(component.filtrosForm.get('busqueda')).toBeDefined();
    expect(component.filtrosForm.get('ordenamiento')).toBeDefined();
  });

  it('debe mostrar error si no hay grupo y se intenta cargar datos', () => {
    component['idGrupoActual'] = null;
    const spy = spyOn(component['grupoService'], 'obtenerGrupoConMiembros');
    (component as any).cargarDatosGrupo();
    expect(spy).not.toHaveBeenCalled();
  });

  it('debe aplicar filtros al cambiar el formulario', () => {
    const spy = spyOn(component as any, 'aplicarFiltros');
    component.filtrosForm.get('busqueda')?.setValue('test');
    component.filtrosForm.get('ordenamiento')?.setValue('monto_asc');
    component.filtrosForm.updateValueAndValidity();
    // Esperar debounceTime (simulado)
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
    }, 350);
  });

  it('debe mostrar un snackBar en error al cargar gastos', () => {
    const snackSpy = spyOn(component['snackBar'], 'open');
    component.loading = true;
    component.error = 'Error de API';
    component['snackBar'].open('Error al cargar gastos', 'Cerrar', { duration: 3000 });
    expect(snackSpy).toHaveBeenCalled();
  });

  // Puedes agregar más tests para paginación, interacción de usuario, mocks de servicios, etc.
});
