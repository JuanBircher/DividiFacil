
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { EditarComponent } from './editar.component';
import { AuthService } from '../../../core/auth.service';
import { of, throwError } from 'rxjs';

describe('EditarComponent', () => {
  let component: EditarComponent;
  let fixture: ComponentFixture<EditarComponent>;
  let authServiceSpy: jasmine.SpyObj<any>;
  let snackBarSpy: jasmine.SpyObj<any>;

  const mockUsuario = { idUsuario: 'u1', nombre: 'Juan', email: 'juan@test.com', fechaRegistro: '2024-01-01T00:00:00Z' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['obtenerUsuario', 'actualizarPerfil']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [EditarComponent, HttpClientTestingModule, ReactiveFormsModule, MatSnackBarModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con datos del usuario', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    fixture.detectChanges();
    expect(component.perfilForm.value.nombre).toBe('Juan');
    expect(component.perfilForm.value.email).toBe('juan@test.com');
  });

  it('debería validar el formulario', () => {
    fixture.detectChanges();
    component.perfilForm.get('nombre')?.setValue('');
    expect(component.perfilForm.valid).toBeFalse();
    component.perfilForm.get('nombre')?.setValue('Juan');
    expect(component.perfilForm.valid).toBeTrue();
  });

  it('debería actualizar el perfil correctamente', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    authServiceSpy.actualizarPerfil.and.returnValue(of({ exito: true }));
    fixture.detectChanges();
    component.perfilForm.get('nombre')?.setValue('Nuevo Nombre');
    component.actualizarPerfil();
    expect(authServiceSpy.actualizarPerfil).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });

  it('debería mostrar error si actualizar perfil falla', () => {
    authServiceSpy.obtenerUsuario.and.returnValue(mockUsuario);
    authServiceSpy.actualizarPerfil.and.returnValue(throwError(() => 'error'));
    fixture.detectChanges();
    component.actualizarPerfil();
    expect(snackBarSpy.open).toHaveBeenCalled();
  });
});
