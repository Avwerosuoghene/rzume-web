import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';

import { HeaderComponent } from './header.component';
import { StorageService } from '../../../core/services';
import { LoaderService } from '../../../core/services/loader.service';
import { AuthHelperService } from '../../../core/services/auth-helper.service';
import { SearchStateService } from '../../../core/services/search-state.service';
import { ScreenManagerService } from '../../../core/services/screen-manager.service';
import { User } from '../../../core/models';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockAuthHelperService: jasmine.SpyObj<AuthHelperService>;
  let mockSearchStateService: jasmine.SpyObj<SearchStateService>;
  let mockScreenManagerService: jasmine.SpyObj<ScreenManagerService>;

  const mockUser: User = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    onBoardingStage: 1,
    emailConfirmed: true
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/main/dashboard',
      events: of(new NavigationEnd(1, '/main/dashboard', '/main/dashboard'))
    });
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [], {
      user$: of(mockUser)
    });
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', [], {
      globalLoaderSubject: of(false)
    });
    const authHelperServiceSpy = jasmine.createSpyObj('AuthHelperService', ['logout']);
    const searchStateServiceSpy = jasmine.createSpyObj('SearchStateService', ['updateSearchTerm']);
    const screenManagerServiceSpy = jasmine.createSpyObj('ScreenManagerService', [], {
      isMobile$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AuthHelperService, useValue: authHelperServiceSpy },
        { provide: SearchStateService, useValue: searchStateServiceSpy },
        { provide: ScreenManagerService, useValue: screenManagerServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockStorageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    mockLoaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    mockAuthHelperService = TestBed.inject(AuthHelperService) as jasmine.SpyObj<AuthHelperService>;
    mockSearchStateService = TestBed.inject(SearchStateService) as jasmine.SpyObj<SearchStateService>;
    mockScreenManagerService = TestBed.inject(ScreenManagerService) as jasmine.SpyObj<ScreenManagerService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeComponent).toBe('dashboard');
    expect(component.userInfo).toEqual(mockUser);
    expect(component.loaderIsActive).toBe(false);
    expect(component.isMobile).toBe(false);
    expect(component.todaysDate).toBeDefined();
  });

  it('should setup screen manager subscription', () => {
    const isMobileSubject = new Subject<boolean>();
    Object.defineProperty(mockScreenManagerService, 'isMobile$', {
      writable: true,
      value: isMobileSubject.asObservable()
    });
    
    component.setupScreenManagerSubscription();
    
    isMobileSubject.next(true);
    expect(component.isMobile).toBe(true);
    
    isMobileSubject.next(false);
    expect(component.isMobile).toBe(false);
  });

  it('should get current route and set active component', () => {
    Object.defineProperty(mockRouter, 'url', {
      writable: true,
      value: '/main/profile-management'
    });
    
    component.getCurrentRoute();
    
    expect(component.activeComponent).toBe('profile management');
  });

  it('should handle route with no segments gracefully', () => {
    Object.defineProperty(mockRouter, 'url', {
      writable: true,
      value: ''
    });
    
    component.getCurrentRoute();
    
    // Should not throw error
    expect(component).toBeTruthy();
  });

  it('should subscribe to router events', () => {
    const navigationEnd = new NavigationEnd(1, '/main/profile-management', '/main/profile-management');
    Object.defineProperty(mockRouter, 'events', {
      writable: true,
      value: of(navigationEnd)
    });
    spyOn(component, 'getCurrentRoute');
    
    component.subscribeToRoute();
    
    expect(component.getCurrentRoute).toHaveBeenCalled();
  });

  it('should get user info from storage service', () => {
    const newUser: User = { ...mockUser, firstName: 'Jane' };
    const userSubject = new Subject<User>();
    Object.defineProperty(mockStorageService, 'user$', {
      writable: true,
      value: userSubject.asObservable()
    });
    
    component.getUserInfo();
    
    userSubject.next(newUser);
    expect(component.userInfo).toEqual(newUser);
  });

  it('should initiate loader subscription', () => {
    const loaderSubject = new Subject<boolean>();
    Object.defineProperty(mockLoaderService, 'globalLoaderSubject', {
      writable: true,
      value: loaderSubject.asObservable()
    });
    
    component.initiateLoader();
    
    loaderSubject.next(true);
    expect(component.loaderIsActive).toBe(true);
    
    loaderSubject.next(false);
    expect(component.loaderIsActive).toBe(false);
  });

  it('should emit sidebar toggle event', () => {
    spyOn(component.sidebarToggle, 'emit');
    
    component.toggleSidebar();
    
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('should handle search change', () => {
    const searchTerm = 'test search';
    
    component.onSearchChange(searchTerm);
    
    expect(mockSearchStateService.updateSearchTerm).toHaveBeenCalledWith(searchTerm);
  });

  it('should logout user', () => {
    component.logout();
    
    expect(mockAuthHelperService.logout).toHaveBeenCalled();
  });

  it('should clear browser storage', () => {
    spyOn(sessionStorage, 'clear');
    spyOn(localStorage, 'clear');
    
    component.clearBrowserStorage();
    
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
