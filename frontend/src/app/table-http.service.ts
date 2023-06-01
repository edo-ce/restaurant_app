import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserHttpService } from './user-http.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Table } from './model/Table';

@Injectable({
  providedIn: 'root'
})
export class TableHttpService {

  constructor(private http: HttpClient, private us: UserHttpService) {
    console.log('User service token: ' + us.get_token());
  }

  // returns the list of existing tables
  get_tables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.us.url + '/tables', this.us.create_options({})).pipe(
        tap( (data) => {
          console.log(JSON.stringify(data));
        }),
        catchError(this.us.handleError)
    );
  }

  set_table(number: number, data: Object): Observable<Table> {
    return this.http.post<Table>(this.us.url + '/tables/' + number, data, this.us.create_options({})).pipe(
      catchError(this.us.handleError)
    )
  }
}
