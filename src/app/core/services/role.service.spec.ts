import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RoleService } from './role.service';
import { ApiService } from './api.service';
import { RoleStateService } from './role-state.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';
import { APIResponse } from '../models';
import { Role, CreateRolePayload, RoleStats } from '../models/interface/role.models';

describe('RoleService', () => {
  let service: RoleService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let roleStateSpy: jasmine.SpyObj<RoleStateService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  const okResponse = <T>(data?: T): APIResponse<T> => ({ statusCode: 200, success: true, message: '', data });
  const role = { id: '1', userId: 'u1', jobRole: 'Engineer', industry: 'Tech', documents: [], createdAt: new Date(), updatedAt: new Date() } as Role;

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    roleStateSpy = jasmine.createSpyObj('RoleStateService', ['setLoading', 'setError', 'setRoles', 'addRole', 'removeRole', 'setStats']);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['track']);

    TestBed.configureTestingModule({
      providers: [
        RoleService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: RoleStateService, useValue: roleStateSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy }
      ]
    });

    service = TestBed.inject(RoleService);
  });

  describe('getRoles', () => {
    it('should set loading true immediately, then update roles and clear loading on success', (done) => {
      apiServiceSpy.get.and.returnValue(of(okResponse([role])));

      service.getRoles().subscribe(() => {
        expect(roleStateSpy.setLoading).toHaveBeenCalledWith(true);
        expect(roleStateSpy.setError).toHaveBeenCalledWith(null);
        expect(roleStateSpy.setRoles).toHaveBeenCalledWith([role]);
        expect(roleStateSpy.setLoading).toHaveBeenCalledWith(false);
        done();
      });
    });

    it('should set an error message and clear loading, then re-throw on failure', (done) => {
      const error = new Error('network down');
      apiServiceSpy.get.and.returnValue(throwError(() => error));

      service.getRoles().subscribe({
        error: (err) => {
          expect(roleStateSpy.setError).toHaveBeenCalledWith('Failed to load roles');
          expect(roleStateSpy.setLoading).toHaveBeenCalledWith(false);
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should not update roles when the response is unsuccessful', () => {
      apiServiceSpy.get.and.returnValue(of({ statusCode: 200, success: false, message: '' } as APIResponse<Role[]>));
      service.getRoles().subscribe();
      expect(roleStateSpy.setRoles).not.toHaveBeenCalled();
    });
  });

  describe('createRole', () => {
    const payload: CreateRolePayload = { title: 'Engineer', industryId: 1, documents: [] };

    it('should add the role to state and track creation on success', (done) => {
      apiServiceSpy.post.and.returnValue(of(okResponse(role)));

      service.createRole(payload).subscribe(() => {
        expect(roleStateSpy.addRole).toHaveBeenCalledWith(role);
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ROLE_CREATED, {
          title: 'Engineer', industryId: 1, documentCount: 0
        });
        done();
      });
    });

    it('should track failure and re-throw on error', (done) => {
      const error = new Error('create failed');
      apiServiceSpy.post.and.returnValue(throwError(() => error));

      service.createRole(payload).subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ROLE_CREATE_FAILED, jasmine.objectContaining({
            title: 'Engineer'
          }));
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should not throw when the error itself is null (fixed — see findings log #34)', () => {
      apiServiceSpy.post.and.returnValue(throwError(() => null));
      expect(() => service.createRole(payload).subscribe({ error: () => {} })).not.toThrow();
    });
  });

  describe('deleteRole', () => {
    it('should remove the role from state and track deletion on success', (done) => {
      apiServiceSpy.delete.and.returnValue(of(okResponse(true)));

      service.deleteRole('role-1').subscribe(() => {
        expect(roleStateSpy.removeRole).toHaveBeenCalledWith('role-1');
        expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ROLE_DELETED, { roleId: 'role-1' });
        done();
      });
    });

    it('should track failure and re-throw on error', (done) => {
      const error = new Error('delete failed');
      apiServiceSpy.delete.and.returnValue(throwError(() => error));

      service.deleteRole('role-1').subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).toHaveBeenCalledWith(AnalyticsEvent.ROLE_DELETE_FAILED, jasmine.objectContaining({
            roleId: 'role-1'
          }));
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('getRoleStats', () => {
    it('should update state with the returned stats on success', (done) => {
      const stats: RoleStats = { createdCount: 1, maxAllowed: 2 };
      apiServiceSpy.get.and.returnValue(of(okResponse(stats)));

      service.getRoleStats().subscribe(() => {
        expect(roleStateSpy.setStats).toHaveBeenCalledWith(stats);
        done();
      });
    });

    it('should re-throw without tracking analytics on error (unlike getRoles/createRole/deleteRole)', (done) => {
      const error = new Error('stats failed');
      apiServiceSpy.get.and.returnValue(throwError(() => error));

      service.getRoleStats().subscribe({
        error: (err) => {
          expect(analyticsServiceSpy.track).not.toHaveBeenCalled();
          expect(err).toBe(error);
          done();
        }
      });
    });
  });
});
