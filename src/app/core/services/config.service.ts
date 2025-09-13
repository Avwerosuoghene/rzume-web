import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: any;

  constructor(private http: HttpClient) { }

  async loadConfig() {
    try {
          const config = await firstValueFrom(this.http.get('/assets/config/config.json'));
          this.config = config;
      } catch (err) {
          console.error(err);
      }
  }

  get apiUrls() {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.apiUrls;
  }

  get featureFlags() {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.featureFlags;
  }
}
