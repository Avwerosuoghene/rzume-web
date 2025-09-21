import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from '../login/login.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { PasswordStrength } from '../../../core/models/enums/password-strength.enum';
import { PasswordVisibility, ErrorResponse } from '../../../core/models';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['signup', 'loadGoogleScript']);
    authServiceSpy.loadGoogleScript.and.returnValue(Promise.resolve());
    const googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['handleCredentialResponse', 'handleGoogleAuthResponse']);
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      _openDialogs: []
    });
    dialogSpy.open.and.returnValue(mockDialogRef);
    const activatedRouteSpy = {
      queryParams: of({}),
      params: of({})
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent, NoopAnimationsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: GoogleAuthService, useValue: googleAuthServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    
    // Mock the ViewChild components before detectChanges
    component.passwordCheckerComp = {
      checkPasswordStrength: jasmine.createSpy('checkPasswordStrength').and.returnValue({ score: 4, strength: 'STRONG' })
    } as any;
    
    component.googleButtonComponent = {
      initiateGoogleSignup: jasmine.createSpy('initiateGoogleSignup'),
      toggleLoader: jasmine.createSpy('toggleLoader')
    } as any;
    
    mockAuthService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    mockGoogleAuthService = TestBed.inject(GoogleAuthService) as jasmine.SpyObj<GoogleAuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(mockRouter, 'navigate');
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signup form with validators', () => {
    expect(component.signupFormGroup).toBeDefined();
    expect(component.signupFormGroup.get('email')).toBeDefined();
    expect(component.signupFormGroup.get('password')).toBeDefined();
    expect(component.signupFormGroup.get('termsChecked')).toBeDefined();
  });

  it('should validate email field', () => {
    const emailControl = component.signupFormGroup.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.signupFormGroup.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);
    
    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate terms checkbox', () => {
    const termsControl = component.signupFormGroup.get('termsChecked');
    
    termsControl?.setValue(false);
    expect(termsControl?.hasError('required')).toBe(true);
    
    termsControl?.setValue(true);
    expect(termsControl?.valid).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisibility).toBe(PasswordVisibility.password);
    
    component.togglePasswordVisibility();
    
    expect(component.passwordVisibility).toBe(PasswordVisibility.text);
  });

  it('should disable button when form is invalid', () => {
    component.signupFormGroup.patchValue({
      email: '',
      password: '',
      termsChecked: false
    });
    
    expect(component.isBtnDisabled).toBe(true);
  });

  it('should disable button when password strength is not strong', () => {
    component.signupFormGroup.patchValue({
      email: 'test@example.com',
      password: 'weak',
      termsChecked: true
    });
    component.passwordStrength = { score: 2, strength: PasswordStrength.MEDIUM };
    
    expect(component.isBtnDisabled).toBe(true);
  });

  it('should enable button when form is valid and password is strong', () => {
    component.signupFormGroup.patchValue({
      email: 'test@example.com',
      password: 'StrongPassword123!',
      termsChecked: true
    });
    component.passwordStrength = { score: 4, strength: PasswordStrength.STRONG };
    
    expect(component.isBtnDisabled).toBe(false);
  });

  it('should handle successful signup', () => {
    const mockResponse = { success: true, statusCode: 200, message: 'Success', data: undefined };
    const userEmail = 'test@example.com';
    mockAuthService.signup.and.returnValue(of(mockResponse));
    
    component.signupFormGroup.patchValue({
      email: userEmail,
      password: 'StrongPassword123!',
      termsChecked: true
    });
    component.passwordStrength = { score: 4, strength: PasswordStrength.STRONG };
    
    component.submitSignupForm();
    
    expect(mockAuthService.signup).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/email-confirmation']);
  });

  it('should handle signup error', () => {
    const mockError: ErrorResponse = { errorMessage: 'Signup failed', statusCode: 400 };
    mockAuthService.signup.and.returnValue(throwError(mockError));
    spyOn(component, 'showErrorDialog');
    
    component.signupFormGroup.patchValue({
      email: 'test@example.com',
      password: 'StrongPassword123!',
      termsChecked: true
    });
    component.passwordStrength = { score: 4, strength: PasswordStrength.STRONG };
    
    component.submitSignupForm();
    
    expect(component.showErrorDialog).toHaveBeenCalledWith('Signup failed');
    expect(component.loaderIsActive).toBe(false);
  });

  it('should handle Google login success', () => {
    component.handleGoogleLoginSuccess(true, 'mock-token');
    
    expect(mockGoogleAuthService.handleGoogleAuthResponse).toHaveBeenCalledWith(true, 'mock-token');
    expect(component.loaderIsActive).toBe(false);
  });

  it('should handle Google login error', () => {
    const mockError: ErrorResponse = { errorMessage: 'Google login failed', statusCode: 400 };
    
    component.handleGoogleLoginError(mockError);
    
    expect(component.loaderIsActive).toBe(false);
  });

  it('should reset form', () => {
    component.signupFormGroup.patchValue({
      email: 'test@example.com',
      password: 'password',
      termsChecked: true
    });
    
    component.resetSignupForm();
    
    expect(component.signupFormGroup.get('email')?.value).toBe('');
    expect(component.signupFormGroup.get('password')?.value).toBe('');
    expect(component.signupFormGroup.get('termsChecked')?.value).toBe(false);
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
