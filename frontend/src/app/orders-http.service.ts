import { Injectable } from '@angular/core';
import { Order } from './model/Order';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UserHttpService } from './user-http.service';
import { TableHttpService } from './table-http.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersHttpService {

  private static FEE: number = 2;

  constructor(private http: HttpClient, private us: UserHttpService, private ts: TableHttpService) { }

  get_orders(number: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.us.url}/table/${number}/orders`, this.us.create_options({})).pipe(
      tap( (data) => {
        // console.log(JSON.stringify(data));
      }),
      catchError(this.us.handleError)
    );
  }

  post_order(data: Object): Observable<Order> {
    return this.http.post<Order>(this.us.url + '/orders', data, this.us.create_options()).pipe(
      catchError(this.us.handleError)
    );
  }

  delete_order(id: any): Observable<Order> {
    return this.http.delete<Order>(this.us.url + '/orders/' + id, this.us.create_options()).pipe(
      catchError(this.us.handleError)
    );
  }

  set_order(id: any, data: Object): Observable<Order> {
    return this.http.post<Order>(this.us.url + '/orders/' + id, data, this.us.create_options({})).pipe(
      catchError(this.us.handleError)
    )
  }

  compute_price(orders: Order[], table_seats: number): number {
    if (orders.length === 0)
      return 0;

    let total_price: number = table_seats * OrdersHttpService.FEE;
    orders.forEach((order) => {
      order.dishes.forEach((dish_pair) => {
        total_price += (dish_pair[0].price * dish_pair[1]);
      });
    });
    return total_price;
  }
}
