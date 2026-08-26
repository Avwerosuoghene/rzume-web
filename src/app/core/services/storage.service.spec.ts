import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { User } from '../models';

describe('StorageService', () => {
  let service: StorageService;
  const user = { email: 'user@example.com' } as User;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StorageService] });
    service = TestBed.inject(StorageService);
  });

  it('should start with a null user', (done) => {
    service.user$.subscribe(u => {
      expect(u).toBeNull();
      done();
    });
  });

  it('should emit the user after setUser', (done) => {
    service.setUser(user);
    service.user$.subscribe(u => {
      expect(u).toBe(user);
      done();
    });
  });

  it('should emit null after clearUser', (done) => {
    service.setUser(user);
    service.clearUser();
    service.user$.subscribe(u => {
      expect(u).toBeNull();
      done();
    });
  });

  it('should give a late subscriber the current user immediately', () => {
    service.setUser(user);
    let received: User | null | undefined;
    service.user$.subscribe(u => (received = u));
    expect(received).toBe(user);
  });
});
