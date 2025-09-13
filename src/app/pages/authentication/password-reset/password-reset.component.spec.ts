import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PasswordResetComponent } from './password-reset.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { RoutingUtilService } from '../../../core/services/routing-util.service';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['resetPassword']);
    const routingUtilServiceSpy = jasmine.createSpyObj('RoutingUtilService', ['navigateToRoute']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = {
      queryParams: of({ token: 'mock-token' }),
      pipe: jasmine.createSpy('pipe').and.returnValue(of({ token: 'mock-token' }))
    };

    authServiceSpy.resetPassword.and.returnValue(of({ success: true, statusCode: 200, message: 'Success', data: undefined }));

    await TestBed.configureTestingModule({
      imports: [PasswordResetComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: RoutingUtilService, useValue: routingUtilServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
