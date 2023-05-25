import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Table } from './model/Table';

@Injectable({
  providedIn: 'root'
})
export class TableHttpService {

  constructor(private http: HttpClient, private us: UserHttpService) {
    console.log('Message service instantiated');
    console.log('User service token: ' + us.get_token());
  }

  // TODO: can be a service used by more classes
  private create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };
  }

  // TODO: can be a service used by more classes
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }

    return throwError(() => new Error('Something bad happened; please try again later.') );
  }

  // returns the list of existing tables
  get_tables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.us.url + '/tables', this.create_options({})).pipe(
        tap( (data) => {
          console.log(JSON.stringify(data));
        }),
        catchError(this.handleError)
    );
  }

  set_table(number: number, data: Object): Observable<Table> {
    return this.http.post<Table>(this.us.url + '/tables/' + number, this.create_options(data)).pipe(
      catchError(this.handleError)
    )
  }
}
