import { Injectable } from '@angular/core';
import { Order } from './model/Order';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserHttpService } from './user-http.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersHttpService {

  constructor(private http: HttpClient, private us: UserHttpService) { }

  get_orders(model: string, parameter: any): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.us.url}/${model}/${parameter}/orders`, this.us.create_options({})).pipe(
      tap( (data) => {
        
      }),
      catchError(this.us.handleError)
    );
  }
}
