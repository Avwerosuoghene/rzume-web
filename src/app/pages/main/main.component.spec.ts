import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

import { MainComponent } from './main.component';
import { UiStateService } from '../../core/services/ui-state.service';
import { MOBILE_BREAKPOINT } from '../../core/models/constants/shared.constants';
import { ConfigService } from '../../core/services/config.service';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let mockUiStateService: jasmine.SpyObj<UiStateService>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;


  beforeEach(async () => {
    const uiStateServiceSpy = jasmine.createSpyObj('UiStateService', [], {
      isMobile$: of(false)
    });

    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['loadConfig'], {
      apiUrls: { backend: 'https://mock-backend.com', googleAuth: 'mock-client-id' },
      featureFlags: { enableProfileManagement: false }
    });

    // Mock loadConfig to return a resolved promise
    configServiceSpy.loadConfig.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [MainComponent, NoopAnimationsModule, RouterTestingModule.withRoutes([
        { path: 'main/dashboard', component: MainComponent }
      ]), HttpClientTestingModule],
      providers: [
        { provide: UiStateService, useValue: uiStateServiceSpy },
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    mockUiStateService = TestBed.inject(UiStateService) as jasmine.SpyObj<UiStateService>;
    mockConfigService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;

    // Navigate to a valid route to set router.url
    const router = TestBed.inject(Router);
    await router.navigate(['/main/dashboard']);

    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up any DOM modifications - restore to default 'auto'
    document.body.style.overflow = 'auto';
    if (component) {
      component.ngOnDestroy();
    }
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.sidebarOpen).toBe(false);
    expect(component.isMobileView).toBe(false);
    expect(component.subscriptions).toBeDefined();
  });

  it('should setup mobile view subscription', () => {
    const isMobileSubject = new Subject<boolean>();
    Object.defineProperty(mockUiStateService, 'isMobile$', {
      writable: true,
      value: isMobileSubject.asObservable()
    });

    component.initiateSubscriptions();

    isMobileSubject.next(true);
    expect(component.isMobileView).toBe(true);

    isMobileSubject.next(false);
    expect(component.isMobileView).toBe(false);
  });

  it('should toggle sidebar state', () => {
    expect(component.sidebarOpen).toBe(false);

    component.toggleSidebar();

    expect(component.sidebarOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    component.toggleSidebar();

    expect(component.sidebarOpen).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should close sidebar', fakeAsync(() => {
    component.sidebarOpen = true;
    
    // Wait for initialization to complete
    tick(100);
    
    component.closeSidebar();
    expect(component.sidebarOpen).toBeFalse();
  }));

  it('should update layout based on window size', fakeAsync(() => {

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT - 1
    });

    // Wait for initialization to complete
    tick(100);

    component.updateLayout();

    expect(component.isMobileView).toBe(true);
    expect(component.sidebarOpen).toBe(false);

    // Test desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT + 1
    });

    component.sidebarOpen = true;
    component.updateLayout();

    expect(component.isMobileView).toBe(false);
    expect(component.sidebarOpen).toBe(false);
  }));

  it('should handle window resize', () => {
    spyOn(component, 'updateLayout');

    component.onResize();

    expect(component.updateLayout).toHaveBeenCalled();
  });

  it('should lock and unlock scroll', () => {
    component.lockScroll(true);
    expect(document.body.style.overflow).toBe('hidden');

    component.lockScroll(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component.subscriptions, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.subscriptions.unsubscribe).toHaveBeenCalled();
  });
});
