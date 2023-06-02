import { Injectable } from '@angular/core';
import { UserHttpService } from './user-http.service';
import { Dish } from './model/Dish';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DishHttpService {

  constructor(private us: UserHttpService, private http: HttpClient) { }

  get_dishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>(this.us.url + '/dishes', this.us.create_options({})).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
      }),
      catchError(this.us.handleError)
    );
  }

  post_dish(data: Dish): Observable<Dish> {
    return this.http.post<Dish>(this.us.url + '/dishes', data, this.us.create_options()).pipe(
      catchError(this.us.handleError)
    );
  }

  delete_dish(name: string): Observable<Dish> {
    return this.http.delete<Dish>(this.us.url + '/dishes/' + name, this.us.create_options()).pipe(
      catchError(this.us.handleError)
    );
  }
}
