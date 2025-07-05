import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalanceGrupoComponent } from './balance-grupo.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('BalanceGrupoComponent', () => {
  let component: BalanceGrupoComponent;
  let fixture: ComponentFixture<BalanceGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BalanceGrupoComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
