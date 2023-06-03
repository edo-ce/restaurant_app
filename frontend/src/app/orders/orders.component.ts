import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../model/Order';
import { OrdersHttpService } from '../orders-http.service';
import { TableHttpService } from '../table-http.service';
import { Router } from '@angular/router';
import { Table } from '../model/Table';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  private model: any;
  private parameter: any;
  public orders: Order[] = [];
  public total_price: number = -1;
  public table_seats: number = 0;
  errmessage = undefined;

  constructor(private route: ActivatedRoute, private os: OrdersHttpService, private ts: TableHttpService, private router: Router) { }

  ngOnInit(): void {
    this.model = this.route.snapshot.paramMap.get('model');
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    this.get_orders();
    if (this.model === "table")
      this.get_table_seats();
  }

  public get_parameter() {
    return this.parameter;
  }

  private get_orders(): void {
    this.os.get_orders(this.model, this.parameter).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    });
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
      this.router.navigate(["dashboard"]);
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  public new_order(): void {
    this.router.navigate(["order/table/" + this.parameter]);
  }
}
