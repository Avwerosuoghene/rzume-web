import { TestBed } from '@angular/core/testing';
import { RoleStateService } from './role-state.service';
import { Role, RoleStats } from '../models/interface/role.models';

describe('RoleStateService', () => {
  let service: RoleStateService;

  const role = (id: string): Role =>
    ({ id, title: 'Engineer', industryName: 'Tech', documents: [], createdAt: new Date(), updatedAt: new Date() });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RoleStateService] });
    service = TestBed.inject(RoleStateService);
  });

  it('should start with an empty roles list and default stats', () => {
    expect(service.getRoles()).toEqual([]);
    expect(service.getStats()).toEqual({ createdCount: 0, maxAllowed: 2 });
  });

  describe('setRoles', () => {
    it('should replace the roles list and update createdCount', () => {
      service.setRoles([role('1'), role('2')]);
      expect(service.getRoles()).toHaveSize(2);
      expect(service.getStats().createdCount).toBe(2);
    });
  });

  describe('addRole', () => {
    it('should append a role and increment createdCount', () => {
      service.setRoles([role('1')]);
      service.addRole(role('2'));

      expect(service.getRoles().map(r => r.id)).toEqual(['1', '2']);
      expect(service.getStats().createdCount).toBe(2);
    });
  });

  describe('removeRole', () => {
    it('should remove the matching role and decrement createdCount', () => {
      service.setRoles([role('1'), role('2')]);
      service.removeRole('1');

      expect(service.getRoles().map(r => r.id)).toEqual(['2']);
      expect(service.getStats().createdCount).toBe(1);
    });

    it('should leave the state unchanged when no role matches the id', () => {
      service.setRoles([role('1')]);
      service.removeRole('missing');
      expect(service.getRoles()).toHaveSize(1);
    });
  });

  describe('setStats / setLoading / setError', () => {
    it('should update stats directly', () => {
      service.setStats({ createdCount: 5, maxAllowed: 10 });
      expect(service.getStats()).toEqual({ createdCount: 5, maxAllowed: 10 });
    });

    it('should update the loading flag without affecting roles', () => {
      service.setRoles([role('1')]);
      service.setLoading(true);

      expect(service.getCurrentState().isLoading).toBe(true);
      expect(service.getRoles()).toHaveSize(1);
    });

    it('should update the error message', () => {
      service.setError('Something went wrong');
      expect(service.getCurrentState().error).toBe('Something went wrong');
    });
  });

  describe('resetState', () => {
    it('should reset roles, stats, loading, and error back to defaults', () => {
      service.setRoles([role('1')]);
      service.setLoading(true);
      service.setError('oops');

      service.resetState();

      expect(service.getCurrentState()).toEqual({
        roles: [],
        stats: { createdCount: 0, maxAllowed: 2 },
        isLoading: false,
        error: null
      });
    });
  });

  describe('roles$', () => {
    // Real gap found and fixed: roles$ previously emitted the FULL RoleState (identical to
    // state$) instead of just the roles array its name implies. See test-backfill-findings.md #33.
    it('should emit just the roles array, not the full state', (done) => {
      const roles = [role('1'), role('2')];
      service.setRoles(roles);

      service.roles$.subscribe(emitted => {
        expect(emitted).toEqual(roles);
        done();
      });
    });

    it('should give a late subscriber the current roles immediately', () => {
      const roles = [role('1')];
      service.setRoles(roles);

      let received: Role[] | undefined;
      service.roles$.subscribe(r => (received = r));

      expect(received).toEqual(roles);
    });
  });

  describe('stats$', () => {
    it('should emit just the stats slice, not the full state', (done) => {
      service.setRoles([role('1'), role('2')]);

      service.stats$.subscribe(emitted => {
        expect(emitted).toEqual({ createdCount: 2, maxAllowed: 2 });
        done();
      });
    });

    it('should give a late subscriber the current stats immediately', () => {
      service.setRoles([role('1')]);

      let received: RoleStats | undefined;
      service.stats$.subscribe(s => (received = s));

      expect(received).toEqual({ createdCount: 1, maxAllowed: 2 });
    });
  });

  describe('loading$', () => {
    it('should emit just the isLoading slice, not the full state', (done) => {
      service.setLoading(true);

      service.loading$.subscribe(emitted => {
        expect(emitted).toBe(true);
        done();
      });
    });
  });

  describe('error$', () => {
    it('should emit just the error slice, not the full state', (done) => {
      service.setError('Failed to load roles');

      service.error$.subscribe(emitted => {
        expect(emitted).toBe('Failed to load roles');
        done();
      });
    });
  });

  describe('state$', () => {
    it('should emit the full state object', (done) => {
      service.setLoading(true);
      service.state$.subscribe(state => {
        expect(state.isLoading).toBe(true);
        expect(state.roles).toBeDefined();
        expect(state.stats).toBeDefined();
        done();
      });
    });
  });
});
