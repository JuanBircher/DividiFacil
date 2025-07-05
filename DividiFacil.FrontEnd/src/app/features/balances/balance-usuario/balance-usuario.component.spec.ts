import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalanceUsuarioComponent } from './balance-usuario.component';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('BalanceUsuarioComponent', () => {
  let component: BalanceUsuarioComponent;
  let fixture: ComponentFixture<BalanceUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BalanceUsuarioComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener loading en false por defecto', () => {
    expect(component.loading).toBeFalse();
  });

  it('debería inicializar balanceUsuario como null', () => {
    expect(component.balanceUsuario).toBeNull();
  });
});
