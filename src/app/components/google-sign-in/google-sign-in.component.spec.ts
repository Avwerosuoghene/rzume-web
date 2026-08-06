import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GoogleSignInComponent } from './google-sign-in.component';
import { AuthenticationService } from '../../core/services';
import { ConfigService } from '../../core/services/config.service';
import { GoogleCredentialResponse } from '../../core/models';

describe('GoogleSignInComponent', () => {
  let component: GoogleSignInComponent;
  let fixture: ComponentFixture<GoogleSignInComponent>;
  let initializeSpy: jasmine.Spy;

  beforeEach(async () => {
    const configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
      apiUrls: { backend: 'http://localhost', googleAuth: 'test-google-client-id' }
    });

    await TestBed.configureTestingModule({
      imports: [GoogleSignInComponent, HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: ConfigService, useValue: configServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    initializeSpy = jasmine.createSpy('initialize');
    (globalThis as unknown as { google: unknown }).google = {
      accounts: {
        id: {
          initialize: initializeSpy,
          renderButton: jasmine.createSpy('renderButton')
        }
      }
    };
  });

  afterEach(() => {
    delete (globalThis as { google?: unknown }).google;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createGoogleWrapper', () => {
    // Regression test: the real Google Identity Services callback receives a
    // GoogleCredentialResponse object ({ credential: string, ... }), not a plain string —
    // a previously mistyped `declare let google` stub masked this. tokenEmitter must emit
    // just the extracted credential string, matching its EventEmitter<string> contract.
    it('should emit only the extracted credential string from the raw Google callback response', () => {
      const emitSpy = spyOn(component.tokenEmitter, 'emit');

      component.createGoogleWrapper();

      const initializeConfig = initializeSpy.calls.mostRecent().args[0];
      const mockResponse: GoogleCredentialResponse = { credential: 'real-jwt-credential' };
      initializeConfig.callback(mockResponse);

      expect(emitSpy).toHaveBeenCalledWith('real-jwt-credential');
    });

    it('should pass the configured Google client id to initialize', () => {
      component.createGoogleWrapper();

      const initializeConfig = initializeSpy.calls.mostRecent().args[0];
      expect(initializeConfig.client_id).toBeDefined();
    });
  });
});