import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SideBarComponent } from './side-bar.component';
import { ConfigService } from '../../../core/services/config.service';
import { SideBarElement } from '../../../core/models';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  const mockConfig = {
    featureFlags: {
      enableProfileManagement: true,
      enableAnalytics: false
    }
  };

  beforeEach(async () => {
    const configServiceSpy = jasmine.createSpyObj('ConfigService', ['getConfig'], {
      featureFlags: mockConfig.featureFlags
    });

    await TestBed.configureTestingModule({
      imports: [SideBarComponent, NoopAnimationsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    mockConfigService = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize sidebar elements on init', () => {
    component.ngOnInit();
    
    expect(component.sideBarElements).toBeDefined();
    expect(component.sideBarElements.length).toBeGreaterThan(0);
  });

  it('should include base routes in sidebar elements', () => {
    component.ngOnInit();
    
    const dashboardElement = component.sideBarElements.find(
      (element: SideBarElement) => element.route === '/main/dashboard'
    );
    
    expect(dashboardElement).toBeDefined();
    expect(dashboardElement?.name).toBe('Dashboard');
  });

  it('should include feature routes based on config', () => {
    component.ngOnInit();
    
    const profileElement = component.sideBarElements.find(
      (element: SideBarElement) => element.route === '/main/profile-management'
    );
    
    expect(profileElement).toBeDefined();
  });

  it('should emit close sidebar event', () => {
    spyOn(component.closeSidebar, 'emit');
    
    component.onClose();
    
    expect(component.closeSidebar.emit).toHaveBeenCalled();
  });

  it('should initialize sidebar elements after ngOnInit', () => {
    expect(component.sideBarElements).toBeDefined();
    expect(component.sideBarElements.length).toBeGreaterThan(0);
    
    // Verify elements have required properties
    component.sideBarElements.forEach(element => {
      expect(element.name).toBeDefined();
      expect(element.icon).toBeDefined();
      expect(element.route).toBeDefined();
    });
  });
});
