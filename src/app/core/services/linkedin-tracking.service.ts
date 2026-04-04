import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

declare global {
  interface Window {
    lintrk?: (action: string, data?: LinkedInTrackingData) => void;
    _linkedin_data_partner_ids?: string[];
  }
}

export interface LinkedInConversionEvent {
  conversion_id?: number;
  value?: number;
  currency?: string;
}

interface LinkedInTrackingData {
  conversion_id?: number;
  value?: number;
  currency?: string;
  [key: string]: any;
}

/**
 * Service for tracking LinkedIn conversions and events.
 * Integrates with LinkedIn Insight Tag for advertising campaign measurement.
 * 
 * @example
 * ```typescript
 * const linkedInTracking = inject(LinkedInTrackingService);
 * linkedInTracking.trackSignup();
 * linkedInTracking.trackPurchase(99.99, 'USD');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LinkedInTrackingService {
  private configService = inject(ConfigService);
  
  private readonly MAX_INIT_ATTEMPTS = 50;
  private readonly INIT_CHECK_INTERVAL = 100;
  
  private isInitialized = false;
  private initAttempts = 0;
  private initializationPromise: Promise<boolean> | null = null;

  constructor() {
    this.initializationPromise = this.waitForInitialization();
  }

  /**
   * Waits for LinkedIn Insight Tag to load with timeout protection.
   * @returns Promise that resolves to true if initialized, false if timeout
   */
  private async waitForInitialization(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkInit = (): void => {
        this.initAttempts++;
        
        if (typeof window !== 'undefined' && window.lintrk) {
          this.isInitialized = true;
          resolve(true);
          return;
        }
        
        if (this.initAttempts >= this.MAX_INIT_ATTEMPTS) {
          resolve(false);
          return;
        }
        
        setTimeout(checkInit, this.INIT_CHECK_INTERVAL);
      };
      
      checkInit();
    });
  }

  /**
   * Checks if LinkedIn tracking is enabled via configuration.
   */
  private isTrackingEnabled(): boolean {
    try {
      return this.configService.isAnalyticsEnabled;
    } catch {
      return false;
    }
  }

  /**
   * Tracks a LinkedIn conversion event.
   * @param conversionId Optional LinkedIn conversion ID
   * @param data Optional conversion data (value, currency, etc.)
   */
  async trackConversion(conversionId?: number, data?: LinkedInConversionEvent): Promise<void> {
    if (!this.isTrackingEnabled()) {
      return;
    }

    await this.initializationPromise;

    if (!this.isInitialized || typeof window === 'undefined' || !window.lintrk) {
      return;
    }

    try {
      const trackingData: LinkedInTrackingData = conversionId 
        ? { conversion_id: conversionId, ...data }
        : { ...data };
        
      window.lintrk('track', trackingData);
    } catch (error) {
      // Silent failure - tracking should not break the application
    }
  }

  /**
   * Tracks a user signup conversion.
   * @param value Optional monetary value of the signup
   */
  async trackSignup(value?: number): Promise<void> {
    await this.trackConversion(undefined, {
      value,
      currency: 'USD'
    });
  }

  /**
   * Tracks a purchase conversion.
   * @param value Monetary value of the purchase
   * @param currency Currency code (default: USD)
   */
  async trackPurchase(value: number, currency: string = 'USD'): Promise<void> {
    if (value <= 0) {
      return;
    }

    await this.trackConversion(undefined, {
      value,
      currency
    });
  }

  /**
   * Tracks a custom conversion event.
   * @param eventData Custom event data
   */
  async trackCustomEvent(eventData: LinkedInConversionEvent): Promise<void> {
    await this.trackConversion(undefined, eventData);
  }

  /**
   * Checks if the LinkedIn Insight Tag is ready for tracking.
   * @returns Promise that resolves to initialization status
   */
  async isReady(): Promise<boolean> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.isInitialized;
  }

  /**
   * Gets the LinkedIn partner ID from configuration.
   * @returns Partner ID string or empty string if not configured
   */
  getPartnerId(): string {
    try {
      return this.configService.linkedInPartnerId;
    } catch {
      return '';
    }
  }

  /**
   * Gets the current initialization status synchronously.
   * Use isReady() for async check with wait.
   * @returns Current initialization status
   */
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
