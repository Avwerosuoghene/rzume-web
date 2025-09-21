import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { RoutingUtilService } from '../../../core/services/routing-util.service';
import { ConfigService } from '../../../core/services/config.service';
import { PasswordVisibility, ErrorResponse } from '../../../core/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockGoogleAuthService: jasmine.SpyObj<GoogleAuthService>;
  let mockRoutingUtilService: jasmine.SpyObj<RoutingUtilService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['login', 'loadGoogleScript']);
    const googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', [
      'handleCredentialResponse',
      'handleGoogleAuthResponse'
    ]);
    const routingUtilServiceSpy = jasmine.createSpyObj('RoutingUtilService', ['navigateToMain', 'navigateToAuth']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['loadConfig'], {
      featureFlags: { enableProfileManagement: true }
    });
    const activatedRouteSpy = {
      queryParams: of({}),
      params: of({}),
      snapshot: {
        queryParams: {},
        params: {},
        url: [],
        fragment: null,
        data: {},
        outlet: 'primary',
        component: null,
        routeConfig: null,
        root: {} as any,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: new Map(),
        queryParamMap: new Map()
      },
      url: of([]),
      fragment: of(null),
      data: of({}),
      outlet: 'primary',
      component: null,
      routeConfig: null,
      root: {} as any,
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: []
    };

    configServiceSpy.loadConfig.and.returnValue(Promise.resolve());
    authServiceSpy.loadGoogleScript.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: GoogleAuthService, useValue: googleAuthServiceSpy },
        { provide: RoutingUtilService, useValue: routingUtilServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    component.googleButtonComponent = {
      initiateGoogleSignup: jasmine.createSpy('initiateGoogleSignup'),
      toggleLoader: jasmine.createSpy('toggleLoader')
    } as any;
    
    mockAuthService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    mockGoogleAuthService = TestBed.inject(GoogleAuthService) as jasmine.SpyObj<GoogleAuthService>;
    mockRoutingUtilService = TestBed.inject(RoutingUtilService) as jasmine.SpyObj<RoutingUtilService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockConfigService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
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

  it('should submit login form successfully', () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        token: 'mock-token',
        message: 'Login successful',
        emailConfirmed: true,
        user: {
          id: '1',
          email: 'test@example.com',
          onBoardingStage: 2,
          emailConfirmed: true
        }
      }
    };
    
    mockAuthService.login.and.returnValue(of(mockResponse));
    spyOn(component, 'toggleLoader');
    
    component.loginFormGroup.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.submitLoginForm();
    
    expect(mockAuthService.login).toHaveBeenCalled();
    expect(mockRoutingUtilService.navigateToMain).toHaveBeenCalled();
  });

  it('should handle login error', () => {
    const mockError = { statusCode: 401, errorMessage: 'Invalid credentials' };
    mockAuthService.login.and.returnValue(throwError(mockError));
    spyOn(component, 'toggleLoader');
    
    component.loginFormGroup.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    component.submitLoginForm();
    
    expect(component.toggleLoader).toHaveBeenCalledWith(false);
  });
});
