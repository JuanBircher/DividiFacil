import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AltaGastosComponent } from './alta.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { CdkStepper } from '@angular/cdk/stepper';
import { Subject } from 'rxjs';

describe('AltaGastosComponent', () => {
  let component: AltaGastosComponent;
  let fixture: ComponentFixture<AltaGastosComponent>;

  beforeEach(async () => {
    const changesSubject = new Subject();
    await TestBed.configureTestingModule({
      imports: [
        AltaGastosComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CdkStepper, useValue: {
            _stateChanged: () => {},
            steps: { changes: changesSubject },
            ngOnDestroy: () => {},
            reset: () => {},
            destroy: () => {}
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AltaGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
