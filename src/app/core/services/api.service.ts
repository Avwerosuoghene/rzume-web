import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { ERROR_UNKNOWN, ErrorResponse, GetRequestParams, IconStat, InfoDialogData } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) { }
  public get<T>(requestParams: GetRequestParams, reqHeaders: HttpHeaders ): Observable<T> {
    const {apiRoute, id, _params, handleResponse} =requestParams;

    let route: string = `${environment.apiBaseUrl}/${apiRoute}${id? '/'+id: ''}`;
    let params = new HttpParams();
    if (_params) {
      _params.forEach(param => {
        params = params.set(param.name, param.value);
      })
    }

    const headers = reqHeaders


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

  public put<T>(handleResponse: boolean, apiRoute: string, body: any, id?: number): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}/${id}`;
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    });
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

  public post<T>(apiRoute: string, body: any, handleResponse: boolean): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}`;
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    });
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


  private handleErrorWithObservable(errorResponse: ErrorResponse): Observable<any> {


    const dialogData : InfoDialogData = {
      infoMessage: errorResponse.errorMessage,
      statusIcon: IconStat.failed
    }

    this.dialog.open(InfoDialogComponent, {
      data:dialogData,
      backdropClass: "blurred"
    });


    return throwError(() => errorResponse);
  }
}
