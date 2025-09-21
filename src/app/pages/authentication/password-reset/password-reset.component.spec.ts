import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { PasswordResetComponent } from './password-reset.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { RoutingUtilService } from '../../../core/services/routing-util.service';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['resetPassword']);
    const routingUtilServiceSpy = jasmine.createSpyObj('RoutingUtilService', ['navigateToAuth']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    const activatedRouteSpy = {
      queryParamMap: of(new Map([['token', 'mock-token'], ['email', 'test@example.com']]))
    };

    authServiceSpy.resetPassword.and.returnValue(of({ success: true, statusCode: 200, message: 'Success', data: undefined }));

    await TestBed.configureTestingModule({
      imports: [PasswordResetComponent, NoopAnimationsModule, ReactiveFormsModule],
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
    
    // Mock the ViewChild component before detectChanges
    component.passwordCheckerComp = {
      checkPasswordStrength: jasmine.createSpy('checkPasswordStrength').and.returnValue({ 
        score: 4, 
        strength: 'STRONG' 
      })
    } as any;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});