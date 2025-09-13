import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { RoutingUtilService } from '../../../core/services/routing-util.service';
import { PasswordVisibility, ErrorResponse } from '../../../core/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let mockRoutingUtilService: jasmine.SpyObj<RoutingUtilService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['signin']);
    const googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', [
      'handleCredentialResponse',
      'handleGoogleAuthResponse'
    ]);
    const routingUtilServiceSpy = jasmine.createSpyObj('RoutingUtilService', ['navigateToMain']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: GoogleAuthService, useValue: googleAuthServiceSpy },
        { provide: RoutingUtilService, useValue: routingUtilServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    mockAuthService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    mockGoogleAuthService = TestBed.inject(GoogleAuthService) as jasmine.SpyObj<GoogleAuthService>;
    mockRoutingUtilService = TestBed.inject(RoutingUtilService) as jasmine.SpyObj<RoutingUtilService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validators', () => {
    expect(component.loginFormGroup).toBeDefined();
    expect(component.loginFormGroup.get('email')?.hasError('required')).toBe(true);
    expect(component.loginFormGroup.get('password')?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.loginFormGroup.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisibility).toBe(PasswordVisibility.password);
    
    component.togglePasswordVisibility();
    expect(component.passwordVisibility).toBe(PasswordVisibility.text);
    
    component.togglePasswordVisibility();
    expect(component.passwordVisibility).toBe(PasswordVisibility.password);
  });

  it('should disable button when form is invalid', () => {
    expect(component.isBtnDisabled()).toBe(true);
    
    component.loginFormGroup.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(component.isBtnDisabled()).toBe(false);
  });

  it('should disable button when loader is active', () => {
    component.loginFormGroup.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.loaderIsActive = true;
    
    expect(component.isBtnDisabled()).toBe(true);
  });

  it('should get form element by control name', () => {
    const emailControl = component.getFormElement('email');
    expect(emailControl).toBe(component.loginFormGroup.get('email'));
  });

  it('should handle Google login success', () => {
    spyOn(component, 'toggleLoader');
    const mockGoogleComponent = jasmine.createSpyObj('GoogleSignInComponent', ['toggleLoader']);
    component.googleButtonComponent = mockGoogleComponent;

    component.handleGoogleLoginSuccess(true, 'mock-token');

    expect(component.toggleLoader).toHaveBeenCalledWith(false);
    expect(mockGoogleComponent.toggleLoader).toHaveBeenCalledWith(false);
    expect(mockGoogleAuthService.handleGoogleAuthResponse).toHaveBeenCalledWith(true, 'mock-token');
  });

  it('should handle Google login error', () => {
    spyOn(component, 'toggleLoader');
    const mockGoogleComponent = jasmine.createSpyObj('GoogleSignInComponent', ['toggleLoader']);
    component.googleButtonComponent = mockGoogleComponent;
    const mockError: ErrorResponse = { statusCode: 400, errorMessage: 'Error' };

    component.handleGoogleLoginError(mockError);

    expect(component.toggleLoader).toHaveBeenCalledWith(false);
    expect(mockGoogleComponent.toggleLoader).toHaveBeenCalledWith(false);
  });

  it('should have correct route properties', () => {
    expect(component.signUpRoute).toContain('signup');
    expect(component.forgotPassRoute).toContain('forgotPass');
  });
});
