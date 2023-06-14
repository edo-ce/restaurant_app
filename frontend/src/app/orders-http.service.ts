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

  get_orders(number: any): Observable<Order[]> {
    let route: string = `${this.us.url}/orders`;
    if (number)
      route = `${this.us.url}/table/${number}/orders`;
    return this.http.get<Order[]>(route, this.us.create_options({})).pipe(
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

  // compute price for the total of the orders and add a table fee
  compute_price(orders: Order[], table_seats: number): any {
    if (orders.length === 0)
      return {"total_price": 0, "receipt": {}};

    let receipt: any = {};

    let total_price: number = table_seats * OrdersHttpService.FEE;
    orders.forEach((order) => {
      order.dishes.forEach((dish_pair) => {
        if (receipt[dish_pair[0].name])
          receipt[dish_pair[0].name][1] += dish_pair[1];
        else
          receipt[dish_pair[0].name] = [dish_pair[0].price, dish_pair[1]];
        total_price += (dish_pair[0].price * dish_pair[1]);
      });
    });
    receipt["Fee"] = [OrdersHttpService.FEE, table_seats];
    return {"total_price": total_price, "receipt": receipt};
  }
}
