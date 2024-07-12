import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IApiUrlParam } from '../models/interface/utilities-interface';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { InfoDialogData } from '../models/interface/dialog-models-interface';
import { IconStat } from '../models/enums/ui-enums';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient, private dialog: MatDialog) { }

  public get<T>(apiRoute: string, id?: number, _params?: IApiUrlParam[]): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}/${id}`;
    let params = new HttpParams();
    if (_params) {
      _params.forEach(paramter => {
        params = params.set(paramter.name, paramter.value);
      })
    }

    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    });



    return this.httpClient.get<T>(route, {
      headers, params
    }).pipe(catchError((error) => {
      return this.handleErrorWithObservable(error)

    }))

  }

  public put<T>(apiRoute: string, body: any, id?: number): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}/${id}`;
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    });
    return this.httpClient.put<T>(route, body, {
      headers
    }).pipe(catchError((error) => {

      return throwError(() => error);
    }))
  }

  public post<T>(apiRoute: string, body: any): Observable<T> {
    let route: string = `${environment.apiBaseUrl}/${apiRoute}`;
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    });
    return this.httpClient.post<T>(route, body, {
      headers
    }).pipe(catchError((error) => {
      console.log(error);
      return this.handleErrorWithObservable(error);

    }))
  }


  private handleErrorWithObservable(error: HttpErrorResponse): Observable<any> {

    const errorMessages = error.error.errorMessages;
    const dialogData : InfoDialogData = {
      infoMessage: errorMessages[0],
      statusIcon: IconStat.failed
    }
    this.dialog.open(InfoDialogComponent, {
      data:dialogData,
      backdropClass: "blurred"
    });
    return throwError(() => error);
  }
}
