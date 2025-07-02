import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceGrupoComponent } from './balance-grupo.component';

describe('BalanceGrupoComponent', () => {
  let component: BalanceGrupoComponent;
  let fixture: ComponentFixture<BalanceGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceGrupoComponent]
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
