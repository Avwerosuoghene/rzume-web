import { Route } from '@angular/router';
import { of } from 'rxjs';
import { SelectivePreloadStrategy } from './selective-preload.strategy';

describe('SelectivePreloadStrategy', () => {
  let strategy: SelectivePreloadStrategy;

  beforeEach(() => {
    strategy = new SelectivePreloadStrategy();
  });

  it('should call load() and return its result when route.data.preload is true', () => {
    const route: Route = { path: 'dashboard', data: { preload: true } };
    const loadResult = of('loaded-module');
    const load = jasmine.createSpy('load').and.returnValue(loadResult);

    const result = strategy.preload(route, load);

    expect(load).toHaveBeenCalled();
    expect(result).toBe(loadResult);
  });

  it('should not call load() and should emit null when route.data.preload is false', (done) => {
    const route: Route = { path: 'settings', data: { preload: false } };
    const load = jasmine.createSpy('load');

    strategy.preload(route, load).subscribe((value) => {
      expect(value).toBeNull();
      expect(load).not.toHaveBeenCalled();
      done();
    });
  });

  it('should not call load() and should emit null when route.data is undefined', (done) => {
    const route: Route = { path: 'login' };
    const load = jasmine.createSpy('load');

    strategy.preload(route, load).subscribe((value) => {
      expect(value).toBeNull();
      expect(load).not.toHaveBeenCalled();
      done();
    });
  });
});
