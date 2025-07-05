import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePagosComponent } from './detalle-pagos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('DetallePagosComponent', () => {
  let component: DetallePagosComponent;
  let fixture: ComponentFixture<DetallePagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DetallePagosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // Agrega más tests de lógica y validaciones aquí
});
