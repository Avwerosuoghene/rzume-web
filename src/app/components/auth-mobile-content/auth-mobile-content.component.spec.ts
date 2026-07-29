import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthMobileContentComponent } from './auth-mobile-content.component';
import { ConfigService } from '../../core/services/config.service';

describe('AuthMobileContentComponent', () => {
  let component: AuthMobileContentComponent;
  let fixture: ComponentFixture<AuthMobileContentComponent>;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;

  beforeEach(async () => {
    configServiceSpy = jasmine.createSpyObj(
      'ConfigService',
      ['loadConfig'],
      { landingPageUrl: 'https://rzume.io' }
    );
    configServiceSpy.loadConfig.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [AuthMobileContentComponent],
      providers: [{ provide: ConfigService, useValue: configServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthMobileContentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should start with an empty landing page url before config resolves', () => {
    expect(component.landingPageUrl).toBe('');
  });

  it('should load config and set the landing page url once resolved', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(configServiceSpy.loadConfig).toHaveBeenCalled();
    expect(component.landingPageUrl).toBe('https://rzume.io');
  }));

  it('should render the landing page url as the logo link href', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('https://rzume.io');
  }));
});
