import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { APIResponse, ApiRoutes } from '../models';
import { Industry } from '../models/interface/industry.models';

@Injectable({ providedIn: 'root' })
export class IndustryService {
  constructor(private apiService: ApiService) { }

  getIndustries(): Observable<APIResponse<Industry[]>> {
    return this.apiService.get<APIResponse<Industry[]>>({
      route: ApiRoutes.industries.base,
      withBearer: true,
      handleResponse: true
    });
  }
}
