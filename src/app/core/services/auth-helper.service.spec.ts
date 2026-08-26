import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthHelperService } from './auth-helper.service';
import { AuthenticationService } from './authentication.service';
import { APIResponse } from '../models';
import { LoaderService } from './loader.service';
import { TokenValidationCacheService } from './token-validation-cache.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';

describe('AuthHelperService', () => {
  let service: AuthHelperService;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let cacheServiceSpy: jasmine.SpyObj<TokenValidationCacheService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['logout']);
    loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    cacheServiceSpy = jasmine.createSpyObj('TokenValidationCacheService', ['clearCache']);

    TestBed.configureTestingModule({
      providers: [
        AuthHelperService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TokenValidationCacheService, useValue: cacheServiceSpy }
      ]
    });

    service = TestBed.inject(AuthHelperService);
    spyOn(TokenStorageUtil, 'removeToken');
  });

  describe('logout', () => {
    it('should show the loader immediately', () => {
      authServiceSpy.logout.and.returnValue(of({ success: true } as APIResponse<boolean>));
      service.logout();
      expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
    });

    it('should hide the loader, clear storage, and navigate to sign-in exactly once on success', () => {
      authServiceSpy.logout.and.returnValue(of({ success: true } as APIResponse<boolean>));

      service.logout();

      expect(loaderServiceSpy.hideLoader).toHaveBeenCalledTimes(1);
      expect(TokenStorageUtil.removeToken).toHaveBeenCalledTimes(1);
      expect(cacheServiceSpy.clearCache).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should still hide the loader, clear storage, and navigate exactly once when the logout call errors', () => {
      authServiceSpy.logout.and.returnValue(throwError(() => new Error('network error')));

      service.logout();

      expect(loaderServiceSpy.hideLoader).toHaveBeenCalledTimes(1);
      expect(TokenStorageUtil.removeToken).toHaveBeenCalledTimes(1);
      expect(cacheServiceSpy.clearCache).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    });

    it('should not throw an unhandled error when the logout call errors', () => {
      authServiceSpy.logout.and.returnValue(throwError(() => new Error('network error')));
      expect(() => service.logout()).not.toThrow();
    });
  });
});
