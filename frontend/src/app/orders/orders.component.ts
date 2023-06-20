import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../model/Order';
import { Dish } from '../model/Dish';
import { OrdersHttpService } from '../orders-http.service';
import { TableHttpService } from '../table-http.service';
import { UserHttpService } from '../user-http.service';
import { StatisticsHttpService } from '../statistics-http.service';
import { Router } from '@angular/router';
import { Table } from '../model/Table';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  public table_number: any;
  public orders: Order[] = [];
  private curr_order: any;
  public total_price: number = 0;
  public receipt: any = {};
  public receipt_keys: string[] = [];
  public table_seats: any = undefined;
  errmessage = undefined;
  public status_class: any = {'todo': 'todo', 'in progress': 'progress', 'to serve': 'serve', 'done': 'done'};
  private static STATUS_ENUM: any = {"to serve": 0, "in progress": 1, "todo": 2, "done": 3};

  constructor(private ios: SocketioService, private route: ActivatedRoute, private os: OrdersHttpService, private ts: TableHttpService, 
    private router: Router, private us: UserHttpService, private stats_service: StatisticsHttpService) { }

  ngOnInit(): void {
    this.table_number = this.route.snapshot.paramMap.get('number');
    this.get_socket_orders();
    this.get_orders();
    if (this.table_number)
      this.get_table_seats();
  }

  private get_socket_orders(): void {
    this.ios.get_update('updateOrders').subscribe(() => {
      this.get_orders();
    });
  }

  public get_parameter() {
    return this.table_number;
  }

  public get_role(): string {
    return this.us.get_role();
  }

  public get_curr_order(): Order {
    return this.curr_order;
  }

  public set_curr_order(order: Order): void {
    this.curr_order = order;
  }

  private get_orders(): void {
    this.os.get_orders(this.table_number).subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => OrdersComponent.STATUS_ENUM[a.status] - OrdersComponent.STATUS_ENUM[b.status]);
        console.log(this.orders);
        if (this.table_number)
          this.get_price();
      },
      error: (error) => {
        this.router.navigate(["notfound"]);
      }
    });
  }

  public update_order(data: any): void {
    this.os.set_order(this.curr_order._id.toString(), data).subscribe( {
      next: () => {
      console.log('Order status changed');
      if (data.status === 'to serve') {
        let dishes: [string, number][] = [];
        this.curr_order.dishes.forEach((dish_pair: [Dish, number]) => {
          dishes.push([dish_pair[0].name, +dish_pair[1]]);
        });
        this.stats_service.update_statistic(this.us.get_username(), {'num_orders': 1, 'dishes_prepared': dishes}).subscribe( {
          next: () => {
          console.log('Statistics updated');
          window.location.reload();
        },
        error: (error) => {
          console.log('Error occurred while posting: ' + error);
        }});
      } else {
        window.location.reload();
      }
    },
    error: (error: any) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  private get_table_seats(): void {
    this.ts.get_table(this.table_number).subscribe({
      next: (table: Table) => {
        this.table_seats = table.seats_occupied;
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    })
  }

  private get_price(): void {
    let res = this.os.compute_price(this.orders, this.table_seats);
    this.total_price = +res.total_price;
    this.receipt = res.receipt;
    if (this.receipt instanceof Object)
      this.receipt_keys = Object.keys(this.receipt as Object);
  }

  public free_table() {
    this.ts.set_table(this.table_number, {"occupied": false, "seats_occupied": 0}).subscribe( {
      next: (table) => {
      console.log('Table status changed');
      // remove all the orders of the table
      let count_orders = 0;
      this.orders.forEach((order: Order) => {
        count_orders++;
        this.delete_order(order._id);
      });
      // update user statistics
      if (this.total_price > 0) {
        this.stats_service.update_statistic(this.us.get_username(), {'num_orders': count_orders, 'tables_closed': [+this.table_number, 1, this.total_price], 'total_revenue': this.total_price}).subscribe( {
          next: () => {
          console.log('Statistics updated');
          this.router.navigate(["tables"]);
        },
        error: (error) => {
          console.log('Error occurred while posting: ' + error);
        }});
      } else {
        this.router.navigate(["tables"]);
      }
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  public new_order(): void {
    this.router.navigate(["order/table/" + this.table_number]);
  }

  public delete_order(id: any): void {
    this.os.delete_order(id).subscribe({
      next: () => {
        console.log("Order " + id + " deleted");
        this.errmessage = undefined;
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
      }
    })
  }
}
