import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { ApiUrlParam, ERROR_UNKNOWN, ErrorResponse, GetRequestParams, IconStat, InfoDialogData, SessionStorageKeys } from '../models';
import { SessionStorageUtil } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) { }

  private readonly defaultHeaders = new HttpHeaders({
    'Content-type': 'application/json'
  });

  public get<T>(apiRoute: string, handleResponse: boolean, requestParams?: ApiUrlParam[], reqHeaders?: HttpHeaders, withBearer: boolean = false
  ): Observable<T> {

    let route: string = `${environment.apiBaseUrl}/${apiRoute}`;
    let params = new HttpParams();
    if (requestParams) {
      requestParams.forEach(param => {
        params = params.set(param.name, param.value);
      })
    }

    let headers = this.mergeHeaders(reqHeaders);

    if (withBearer) {
      headers = this.withBearer(headers);
    }

    return this.httpClient.get<T>(route, {
      headers, params
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

  public put<T>(apiRoute: string, body: any, handleResponse: boolean, reqHeaders?: HttpHeaders): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}`;

    const headers = this.mergeHeaders(reqHeaders);

    return this.httpClient.put<T>(route, body, {
      headers
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

  public post<T>(apiRoute: string, body: any, handleResponse: boolean, reqHeaders?: HttpHeaders, withBearer: boolean = false): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}`;

    let headers = this.mergeHeaders(reqHeaders);
    if (withBearer) {
      headers = this.withBearer(headers);
    }

    return this.httpClient.post<T>(route, body, {
      headers
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

  public delete<T>(apiRoute: string, handleResponse: boolean, reqHeaders?: HttpHeaders): Observable<T> {
    const route: string = `${environment.apiBaseUrl}/${apiRoute}`;

    const headers = this.mergeHeaders(reqHeaders);

    return this.httpClient.delete<T>(route, { headers }).pipe(
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

  private mergeHeaders(reqHeaders?: HttpHeaders): HttpHeaders {
    let headers = this.defaultHeaders;
    if (reqHeaders) {
      reqHeaders.keys().forEach(key => {
        headers = headers.set(key, reqHeaders.get(key)!);
      });
    }
    return headers;
  }
}
