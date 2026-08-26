import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { AuthenticationService } from './authentication.service';
import { StorageService } from './storage.service';
import { APIResponse, User } from '../models';

describe('UserService', () => {
  let service: UserService;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  const okResponse = <T>(data?: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });
  const user = { email: 'user@example.com' } as User;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['getActiveUser']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['setUser']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.inject(UserService);
  });

  describe('getActiveUser', () => {
    it('should store the user and resolve true on a successful response', async () => {
      authServiceSpy.getActiveUser.and.returnValue(of(okResponse(user)));

      const result = await service.getActiveUser();

      expect(storageServiceSpy.setUser).toHaveBeenCalledWith(user);
      expect(result).toBe(true);
    });

    it('should reject with INACTIVE_USER when the response is unsuccessful', async () => {
      authServiceSpy.getActiveUser.and.returnValue(of({ statusCode: 200, success: false, message: '' } as APIResponse<User>));

      await expectAsync(service.getActiveUser()).toBeRejectedWithError('User is not active');
      expect(storageServiceSpy.setUser).not.toHaveBeenCalled();
    });

    it('should reject with INACTIVE_USER when the response succeeds but has no data', async () => {
      authServiceSpy.getActiveUser.and.returnValue(of({ statusCode: 200, success: true, message: '' } as APIResponse<User>));

      await expectAsync(service.getActiveUser()).toBeRejectedWithError('User is not active');
    });

    it('should reject with the original error when the request itself errors', async () => {
      const error = new Error('network down');
      authServiceSpy.getActiveUser.and.returnValue(throwError(() => error));

      await expectAsync(service.getActiveUser()).toBeRejectedWith(error);
    });
  });

  describe('refreshActiveUser', () => {
    it('should store the user and emit it on a successful response', (done) => {
      authServiceSpy.getActiveUser.and.returnValue(of(okResponse(user)));

      service.refreshActiveUser().subscribe(result => {
        expect(storageServiceSpy.setUser).toHaveBeenCalledWith(user);
        expect(result).toBe(user);
        done();
      });
    });

    it('should emit null without storing anything when the response is unsuccessful', (done) => {
      authServiceSpy.getActiveUser.and.returnValue(of({ statusCode: 200, success: false, message: '' } as APIResponse<User>));

      service.refreshActiveUser().subscribe(result => {
        expect(result).toBeNull();
        expect(storageServiceSpy.setUser).not.toHaveBeenCalled();
        done();
      });
    });

    it('should propagate an error when the request itself errors (no catchError here — see findings log #16/#40)', (done) => {
      const error = new Error('network down');
      authServiceSpy.getActiveUser.and.returnValue(throwError(() => error));

      service.refreshActiveUser().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });
});
