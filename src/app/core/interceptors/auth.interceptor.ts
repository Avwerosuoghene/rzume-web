// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthHelperService } from '../services/auth-helper.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
     private authHelper: AuthHelperService
    ) { }

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.authHelper.logout();
                }
                return throwError(() => error);
            })
        );
    }
}