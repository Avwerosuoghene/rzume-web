import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { InfoDialogData } from '../models/interface/dialog-models-interface';
import { ErrorMsges, IconStat } from '../models/enums/ui-enums';
import { IErrorResponse } from '../models/interface/errors-interface';
import { IGetRequestParams } from '../models/interface/api-requests-interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) { }
  public get<T>(requestParams: IGetRequestParams, reqHeaders: HttpHeaders ): Observable<T> {
    const {apiRoute, id, _params, handleResponse} =requestParams;

    let route: string = `${environment.apiBaseUrl}/${apiRoute}${id? '/'+id: ''}`;
    let params = new HttpParams();
    if (_params) {
      _params.forEach(paramter => {
        params = params.set(paramter.name, paramter.value);
      })
    }

    const headers = reqHeaders


    return this.httpClient.get<T>(route, {
      headers, params
    }).pipe(catchError((error) => {
      let errorMsg = error?.error?.errorMessages? error?.error?.errorMessages[0]: ErrorMsges.unknown ;

      const responsError: IErrorResponse = {
        statusCode : error.error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)

      this.handleErrorWithObservable(responsError);

      return throwError(() => responsError);

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
      let errorMsg = error?.error?.errorMessages? error?.error?.errorMessages[0]: ErrorMsges.unknown ;

      const responsError: IErrorResponse = {
        statusCode : error.error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)
        return this.handleErrorWithObservable(responsError);
      return throwError(() => responsError);
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
      let errorMsg = error?.error?.errorMessages? error?.error?.errorMessages[0]: ErrorMsges.unknown ;

      const responsError: IErrorResponse = {
        statusCode : error.error.statusCode,
        errorMessage: errorMsg
      }
      if (handleResponse)
      return this.handleErrorWithObservable(responsError);

      return throwError(() => responsError);

    }))
  }


  private handleErrorWithObservable(errorResponse: IErrorResponse): Observable<any> {


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
