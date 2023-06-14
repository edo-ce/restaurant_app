import { Injectable } from '@angular/core';
import { UserHttpService } from './user-http.service';
import { HttpClient } from '@angular/common/http';
import { Statistic } from './model/Statistic';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatisticsHttpService {

  constructor(private us: UserHttpService, private http: HttpClient) { }

  get_statistics(): Observable<Statistic[]> {
    return this.http.get<Statistic[]>(this.us.url + '/statistics', this.us.create_options({})).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
      }),
      catchError(this.us.handleError)
    )
  }

  get_statistic(username: string): Observable<Statistic> {
    return this.http.get<Statistic>(this.us.url + '/statistics/' + username, this.us.create_options({})).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
      }),
      catchError(this.us.handleError)
    )
  }

  update_statistic(username: string, data: Object): Observable<Statistic> {
    return this.http.post<Statistic>(this.us.url + '/statistics/' + username, data, this.us.create_options({})).pipe(
      catchError(this.us.handleError)
    )
  }
}
