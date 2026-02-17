import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { AnalyticsEvent } from '../models/analytics-events.enum';

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
    constructor(private analyticsService: AnalyticsService) { }

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        const startTime = Date.now();

        return next.handle(request).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        const duration = Date.now() - startTime;
                        
                        this.analyticsService.track(AnalyticsEvent.API_CALL_SUCCESS, {
                            endpoint: request.url,
                            method: request.method,
                            status_code: event.status,
                            duration_ms: duration
                        });
                    }
                },
                error: (error: HttpErrorResponse) => {
                    const duration = Date.now() - startTime;
                    
                    this.analyticsService.track(AnalyticsEvent.API_CALL_FAILED, {
                        endpoint: request.url,
                        method: request.method,
                        status_code: error.status,
                        error_message: error.message,
                        duration_ms: duration
                    });
                }
            })
        );
    }
}
