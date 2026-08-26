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
                        // Guarded: tap's callbacks aren't caught by RxJS — if track() itself
                        // threw here, it would replace the real response/error on the stream,
                        // corrupting what downstream interceptors (e.g. AuthInterceptor's 401
                        // check) actually see. Analytics failing must never do that.
                        try {
                            const duration = Date.now() - startTime;

                            this.analyticsService.track(AnalyticsEvent.API_CALL_SUCCESS, {
                                endpoint: request.url,
                                method: request.method,
                                status_code: event.status,
                                duration_ms: duration
                            });
                        } catch (trackingError) {
                            console.error('Failed to track API call success', trackingError);
                        }
                    }
                },
                error: (error: HttpErrorResponse) => {
                    try {
                        const duration = Date.now() - startTime;

                        this.analyticsService.track(AnalyticsEvent.API_CALL_FAILED, {
                            endpoint: request.url,
                            method: request.method,
                            status_code: error.status,
                            error_message: error.message,
                            duration_ms: duration
                        });
                    } catch (trackingError) {
                        console.error('Failed to track API call failure', trackingError);
                    }
                }
            })
        );
    }
}
