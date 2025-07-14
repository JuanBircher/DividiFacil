// ------------------------------------------------------------
// Test de integración de PerfilComponent
// - Verifica creación básica del componente.
// - Recomendado: agregar tests de interacción, feedback visual y mocks de servicios.
// ------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { PerfilComponent } from './perfil.component';
import { AuthService } from '../../../core/auth.service';
import { of, throwError } from 'rxjs';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<any>;

  const mockUsuario = { idUsuario: 'u1', nombre: 'Juan', email: 'juan@test.com', fechaRegistro: '2024-01-01T00:00:00Z' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario', 'logout']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, HttpClientTestingModule, MatSnackBarModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería mostrar datos del usuario', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    fixture.detectChanges();
    expect(component.usuario).toEqual(mockUsuario);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juan');
    expect(compiled.textContent).toContain('juan@test.com');
  });

  it('debería mostrar error si no hay usuario', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(null);
    fixture.detectChanges();
    expect(component.usuario).toBeNull();
  });

  it('debería cerrar sesión correctamente', () => {
    authServiceSpy.logout.and.returnValue(of({}));
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('debería mostrar error si logout falla', () => {
    authServiceSpy.logout.and.returnValue(throwError(() => 'error'));
    component.logout();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });
});
