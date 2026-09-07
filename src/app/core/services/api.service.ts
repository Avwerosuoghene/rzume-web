import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, throwError } from 'rxjs';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { ERROR_UNKNOWN, ErrorResponse, GetRequestOptions, IconStat, InfoDialogData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog, private configService: ConfigService) { }

  public get<T>(options: GetRequestOptions): Observable<T> {

    const { route, params, headers, handleResponse } = options;

    const requestRoute = this.buildRoute(route);
    let requestParams = new HttpParams();
    if (params) {
      params.forEach(param => {
        requestParams = requestParams.set(param.name, param.value);
      })
    }

    const requestHeaders = this.mergeHeaders(headers);

    return this.httpClient.get<T>(requestRoute, {
      headers: requestHeaders, params: requestParams
    }).pipe(this.toErrorOperator<T>(handleResponse));

  }

  public put<T>(apiRoute: string, body: unknown, handleResponse: boolean, reqHeaders?: HttpHeaders, useJsonContentType: boolean = true): Observable<T> {
    const route = this.buildRoute(apiRoute);

    const headers = this.mergeHeaders(reqHeaders, useJsonContentType);

    return this.httpClient.put<T>(route, body, {
      headers: headers
    }).pipe(this.toErrorOperator<T>(handleResponse));
  }

  public post<T>(apiRoute: string, body: unknown, handleResponse: boolean, reqHeaders?: HttpHeaders, withBearer: boolean = false, useJsonContentType: boolean = true): Observable<T> {
    const route = this.buildRoute(apiRoute);

    const headers = this.mergeHeaders(reqHeaders, useJsonContentType);

    return this.httpClient.post<T>(route, body, {
      headers
    }).pipe(this.toErrorOperator<T>(handleResponse));
  }

  public delete<T>(apiRoute: string, handleResponse: boolean, reqHeaders?: HttpHeaders, body?: unknown, useJsonContentType: boolean = true): Observable<T> {
    const route = this.buildRoute(apiRoute);

    const headers = this.mergeHeaders(reqHeaders, useJsonContentType);
    const options = {
      headers,
      body
    };

    return this.httpClient.delete<T>(route, options).pipe(this.toErrorOperator<T>(handleResponse));
  }

  private buildRoute(route: string): string {
    return `${this.configService.apiUrls.backend}/${route}`;
  }

  // Shared shape behind every HTTP verb's error handling: extract a message, build the
  // ErrorResponse, and either route it through the generic error dialog (handleResponse) or just
  // rethrow it for the caller to handle themselves.
  private toErrorOperator<T>(handleResponse: boolean) {
    return catchError<T, Observable<T>>((error) => {
      const errorMsg = error?.error?.message ? error?.error?.message : ERROR_UNKNOWN;

      const responseError: ErrorResponse = {
        statusCode: error.status,
        errorMessage: errorMsg
      };

      if (handleResponse) {
        return this.handleErrorWithObservable(responseError);
      }

      return throwError(() => responseError);
    });
  }


  private handleErrorWithObservable(errorResponse: ErrorResponse): Observable<never> {


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
