import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RoutingUtilService } from './routing-util.service';

describe('RoutingUtilService', () => {
  let service: RoutingUtilService;
  let routerSpy: jasmine.SpyObj<Router>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'], { url: '/main/dashboard' });
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      providers: [
        RoutingUtilService,
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    });

    service = TestBed.inject(RoutingUtilService);
  });

  describe('navigate', () => {
    it('should delegate directly to router.navigate', () => {
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      service.navigate(['/main'], { queryParams: { tab: 'jobs' } });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main'], { queryParams: { tab: 'jobs' } });
    });
  });

  describe('navigateToMain', () => {
    it('should navigate to /main when no sub-route is given', () => {
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      service.navigateToMain();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main'], undefined);
    });

    it('should append the sub-route segments', () => {
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      service.navigateToMain('jobs');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main', 'jobs'], undefined);
    });

    it('should strip leading/trailing slashes and empty segments', () => {
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      service.navigateToMain('/profile-management/');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/main', 'profile-management'], undefined);
    });
  });

  describe('navigateToAuth', () => {
    it('should navigate to /auth with the given sub-route', () => {
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      service.navigateToAuth('login');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth', 'login'], undefined);
    });
  });

  describe('navigateBack', () => {
    // Real bug fixed here: this previously called router.navigateByUrl(router.url) — i.e.
    // re-navigating to the CURRENT url, not going back at all. See test-backfill-findings.md #35.
    it('should use Location.back(), not re-navigate to the current url', () => {
      service.navigateBack();

      expect(locationSpy.back).toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUrl', () => {
    it('should return the router\'s current url', () => {
      expect(service.getCurrentUrl()).toBe('/main/dashboard');
    });
  });
});
