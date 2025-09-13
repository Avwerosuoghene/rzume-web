import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { RequestPasswordResetComponent } from './request-password-reset.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { TimerService } from '../../../core/services/timer.service';

describe('RequestPasswordResetComponent', () => {
  let component: RequestPasswordResetComponent;
  let fixture: ComponentFixture<RequestPasswordResetComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['requestPasswordReset']);
    const timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'stopTimer'], {
      timerValues$: of({ minutes: 0, seconds: 30, timer: 30 })
    });
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy.requestPasswordReset.and.returnValue(of({ success: true, statusCode: 200, message: 'Success', data: undefined }));

    await TestBed.configureTestingModule({
      imports: [RequestPasswordResetComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: TimerService, useValue: timerServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestPasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
