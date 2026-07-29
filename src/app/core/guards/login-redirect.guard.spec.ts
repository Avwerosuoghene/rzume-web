import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginRedirectGuard } from './login-redirect.guard';
import { UserService } from '../services/user.service';
import { LoaderService } from '../services/loader.service';
import { TokenStorageUtil } from '../helpers/token-storage.util';

describe('LoginRedirectGuard', () => {
  let guard: LoginRedirectGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getActiveUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      providers: [
        LoginRedirectGuard,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy }
      ]
    });

    guard = TestBed.inject(LoginRedirectGuard);
  });

  it('should allow access when there is no stored token', async () => {
    spyOn(TokenStorageUtil, 'hasToken').and.returnValue(false);

    const result = await guard.canActivate();

    expect(result).toBe(true);
    expect(userServiceSpy.getActiveUser).not.toHaveBeenCalled();
  });

  it('should block access and redirect to the dashboard when a token is present and valid', async () => {
    spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
    userServiceSpy.getActiveUser.and.returnValue(Promise.resolve(true));
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    const result = await guard.canActivate();

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/main/dashboard']);
  });

  it('should allow access (fail open) when getActiveUser rejects — e.g. token invalid or network error', async () => {
    spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
    userServiceSpy.getActiveUser.and.returnValue(Promise.reject(new Error('User is not active')));

    const result = await guard.canActivate();

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should show and hide the loader around the check regardless of outcome', async () => {
    spyOn(TokenStorageUtil, 'hasToken').and.returnValue(true);
    userServiceSpy.getActiveUser.and.returnValue(Promise.reject(new Error('network down')));

    await guard.canActivate();

    expect(loaderServiceSpy.showLoader).toHaveBeenCalled();
    expect(loaderServiceSpy.hideLoader).toHaveBeenCalled();
  });

  it('should not show the loader at all when there is no token to check', async () => {
    spyOn(TokenStorageUtil, 'hasToken').and.returnValue(false);
    await guard.canActivate();
    expect(loaderServiceSpy.showLoader).not.toHaveBeenCalled();
  });
});
