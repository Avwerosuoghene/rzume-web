import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: any;
  private configLoadPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) { }

  async loadConfig() {
    if (this.configLoadPromise) {
      return this.configLoadPromise;
    }

    this.configLoadPromise = (async () => {
      try {
        const config = await firstValueFrom(this.http.get('/assets/config/config.json'));
        this.config = config;
      } catch (err) {
        console.error(err);
      }
    })();

    return this.configLoadPromise;
  }

  async waitForConfig(): Promise<void> {
    if (this.configLoadPromise) {
      await this.configLoadPromise;
    }
  }

  isConfigLoaded(): boolean {
    return !!this.config;
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

  get mixpanelToken(): string {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    return this.config.analytics?.mixpanelToken || '';
  }

  get isAnalyticsEnabled(): boolean {
    if (!this.config) {
      return false;
    }
    return this.config.analytics?.enabled === true;
  }
}
