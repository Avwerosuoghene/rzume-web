import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';

import { MainComponent } from './main.component';
import { UiStateService } from '../../core/services/ui-state.service';
import { MOBILE_BREAKPOINT } from '../../core/models/constants/shared.constants';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let mockUiStateService: jasmine.SpyObj<UiStateService>;

  beforeEach(async () => {
    const uiStateServiceSpy = jasmine.createSpyObj('UiStateService', [], {
      isMobile$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [MainComponent, NoopAnimationsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: UiStateService, useValue: uiStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    mockUiStateService = TestBed.inject(UiStateService) as jasmine.SpyObj<UiStateService>;
    
    fixture.detectChanges();
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

  it('should close sidebar', () => {
    component.sidebarOpen = true;
    document.body.style.overflow = 'hidden';
    
    component.closeSidebar();
    
    expect(component.sidebarOpen).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should update layout based on window size', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT - 1
    });
    
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
  });

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
