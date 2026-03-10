import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenStorageUtil } from '../helpers/token-storage.util';
import { AuthHelperService } from '../services/auth-helper.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authHelper: AuthHelperService) { }

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        const token = TokenStorageUtil.getToken();
        
        if (token && !request.headers.has('Authorization')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.authHelper.logout();
                    return EMPTY;
                }
                
                return throwError(() => error);
            })
        );
    }
}