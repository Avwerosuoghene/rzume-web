import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IndustryService } from './industry.service';
import { ApiService } from './api.service';
import { APIResponse } from '../models';
import { Industry } from '../models/interface/industry.models';

describe('IndustryService', () => {
  let service: IndustryService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        IndustryService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(IndustryService);
  });

  describe('getIndustries', () => {
    it('should request the industries endpoint with bearer auth and response handling', () => {
      apiServiceSpy.get.and.returnValue(of({ statusCode: 200, success: true, message: '', data: [] } as APIResponse<Industry[]>));

      service.getIndustries().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith({
        route: 'api/industries',
        withBearer: true,
        handleResponse: true
      });
    });

    it('should return the industries from a successful response', (done) => {
      const industries = [{ id: 1, name: 'Tech' }] as Industry[];
      apiServiceSpy.get.and.returnValue(of({ statusCode: 200, success: true, message: '', data: industries } as APIResponse<Industry[]>));

      service.getIndustries().subscribe(response => {
        expect(response.data).toEqual(industries);
        done();
      });
    });
  });
});
