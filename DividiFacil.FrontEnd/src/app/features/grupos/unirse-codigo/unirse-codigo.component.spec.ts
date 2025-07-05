import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnirseCodigoComponent } from './unirse-codigo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('UnirseCodigoComponent', () => {
  let component: UnirseCodigoComponent;
  let fixture: ComponentFixture<UnirseCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnirseCodigoComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnirseCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el formulario inicializado', () => {
    expect(component.codigoForm).toBeDefined();
  });

  // Agrega más tests de lógica y validaciones aquí
});
