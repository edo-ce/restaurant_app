import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../model/Order';
import { OrdersHttpService } from '../orders-http.service';
import { TableHttpService } from '../table-http.service';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';
import { Table } from '../model/Table';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  private model: any;
  private parameter: any;
  public orders: Order[] = [];
  private curr_order: any;
  public total_price: number = -1;
  public table_seats: number = 0;
  errmessage = undefined;
  public status_class: any = {'todo': 'todo', 'in progress': 'progress', 'to serve': 'serve', 'done': 'done'};
  private static STATUS_ENUM: any = {"to serve": 0, "in progress": 1, "todo": 2, "done": 3};

  constructor(private route: ActivatedRoute, private sio: SocketioService, private os: OrdersHttpService, private ts: TableHttpService, 
    private router: Router, private us: UserHttpService) { }

  ngOnInit(): void {
    this.model = this.route.snapshot.paramMap.get('model');
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    /*
    this.sio.connect().subscribe({
      next: (data) => {
        this.get_orders();
      },
      error: (err) => {
        console.log(err);
      }
    });
    */
    this.get_orders(); // TODO: remove
    if (this.model === "table")
      this.get_table_seats();
  }

  public get_parameter() {
    return this.parameter;
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
    this.os.get_orders(this.model, this.parameter).subscribe({
      next: (orders) => {
        // TODO: to test the sorting efficacy
        this.orders = orders.sort((a, b) => OrdersComponent.STATUS_ENUM[a.status] - OrdersComponent.STATUS_ENUM[b.status]);
        console.log(this.orders);
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    });
  }

  public update_order(data: Object): void {
    this.os.set_order(this.curr_order._id.toString(), data).subscribe( {
      next: () => {
      console.log('Order status changed');
    },
    error: (error: any) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  private get_table_seats(): void {
    this.ts.get_table(this.parameter).subscribe({
      next: (table: Table) => {
        this.table_seats = table.seats_occupied;
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    })
  }

  public get_price(): void {
    this.total_price = this.os.compute_price(this.orders, this.table_seats);
  }

  public free_table() {
    this.ts.set_table(this.parameter, {"occupied": false}).subscribe( {
      next: (table) => {
      console.log('Table status changed');
      // TODO: remove all the orders of the table
      this.orders.forEach((order: Order) => {
        this.delete_order(order._id);
      });
      this.ts.set_table(this.parameter, {"seats_occupied": 0}).subscribe( {
        next: () => {
        console.log('Table number of seats occupied is 0');
        this.router.navigate(["dashboard"]);
      },
      error: (error) => {
        console.log('Error occurred while posting: ' + error);
      }});
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  public new_order(): void {
    this.router.navigate(["order/table/" + this.parameter]);
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
