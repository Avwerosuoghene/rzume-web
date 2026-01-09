import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, throwError } from 'rxjs';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { ApiUrlParam, ERROR_UNKNOWN, ErrorResponse, GetRequestOptions, GetRequestParams, IconStat, InfoDialogData, SessionStorageKeys } from '../models';
import { SessionStorageUtil } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog, private configService: ConfigService) { }

  public get<T>(options: GetRequestOptions): Observable<T> {

    const { route, params, headers, withBearer, handleResponse } = options;

    let requestRoute: string = `${this.configService.apiUrls.backend}/${route}`;
    let requestParams = new HttpParams();
    if (params) {
      params.forEach(param => {
        requestParams = requestParams.set(param.name, param.value);
      })
    }

    let requestHeaders = this.mergeHeaders(headers);

    return this.httpClient.get<T>(requestRoute, {
      headers: requestHeaders, params: requestParams, withCredentials: true
    }).pipe(catchError((error) => {
      let errorMsg = error?.error?.message ? error?.error?.message : ERROR_UNKNOWN;

      const responseError: ErrorResponse = {
        statusCode: error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)

        this.handleErrorWithObservable(responseError);

      return throwError(() => responseError);

    }))

  }

  public put<T>(apiRoute: string, body: any, handleResponse: boolean, reqHeaders?: HttpHeaders, useJsonContentType: boolean = true): Observable<T> {
    let route: string = `${this.configService.apiUrls.backend}/${apiRoute}`;

    let headers = this.mergeHeaders(reqHeaders, useJsonContentType);

    return this.httpClient.put<T>(route, body, {
      headers: headers, withCredentials: true
    }).pipe(catchError((error) => {
      let errorMsg = error?.error?.message ? error?.error?.message : ERROR_UNKNOWN;

      const responseError: ErrorResponse = {
        statusCode: error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)
        return this.handleErrorWithObservable(responseError);
      return throwError(() => responseError);
    }))
  }

  public post<T>(apiRoute: string, body: any, handleResponse: boolean, reqHeaders?: HttpHeaders, withBearer: boolean = false, useJsonContentType: boolean = true): Observable<T> {
    let route: string = `${this.configService.apiUrls.backend}/${apiRoute}`;

    let headers = this.mergeHeaders(reqHeaders, useJsonContentType);

    return this.httpClient.post<T>(route, body, {
      headers, withCredentials: true
    }).pipe(catchError((error) => {
      let errorMsg = error?.error?.message ? error?.error?.message : ERROR_UNKNOWN;

      const responseError: ErrorResponse = {
        statusCode: error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)
        return this.handleErrorWithObservable(responseError);

      return throwError(() => responseError);

    }))
  }

  public delete<T>(apiRoute: string, handleResponse: boolean, reqHeaders?: HttpHeaders, body?: any, useJsonContentType: boolean = true): Observable<T> {
    const route: string = `${this.configService.apiUrls.backend}/${apiRoute}`;

    const headers = this.mergeHeaders(reqHeaders, useJsonContentType);
    const options = {
      headers,
      body,
      withCredentials: true
    };

    return this.httpClient.delete<T>(route, options).pipe(
      catchError((error) => {
        const errorMsg = error?.error?.message ? error?.error?.message : ERROR_UNKNOWN;

        const responseError: ErrorResponse = {
          statusCode: error.status,
          errorMessage: errorMsg
        };

        if (handleResponse) {
          return this.handleErrorWithObservable(responseError);
        }

        return throwError(() => responseError);
      })
    );
  }


  private handleErrorWithObservable(errorResponse: ErrorResponse): Observable<any> {


    const dialogData: InfoDialogData = {
      infoMessage: errorResponse.errorMessage,
      statusIcon: IconStat.failed
    }

    this.dialog.open(InfoDialogComponent, {
      data: dialogData,
      backdropClass: "blurred"
    });


    return throwError(() => errorResponse);
  }

  private withBearer(headers: HttpHeaders): HttpHeaders {
    const token = SessionStorageUtil.getItem(SessionStorageKeys.authToken);
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  private mergeHeaders(reqHeaders?: HttpHeaders, useJsonContentType: boolean = true): HttpHeaders {
    let headers = useJsonContentType
      ? new HttpHeaders({ 'Content-Type': 'application/json' })
      : new HttpHeaders();

    if (reqHeaders) {
      reqHeaders.keys().forEach(key => {
        headers = headers.set(key, reqHeaders.get(key)!);
      });
    }

    return headers;
  }
}
