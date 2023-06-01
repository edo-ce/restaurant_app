import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '../model/Order';
import { OrdersHttpService } from '../orders-http.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  private model: any;
  private parameter: any;
  public orders: Order[] = [];

  constructor(private route: ActivatedRoute, private os: OrdersHttpService) { }

  ngOnInit(): void {
    this.model = this.route.snapshot.paramMap.get('model');
    this.parameter = this.route.snapshot.paramMap.get('parameter');
    this.get_orders();
  }

  public get_parameter() {
    return this.parameter;
  }

  public get_orders(): void {
    this.os.get_orders(this.model, this.parameter).subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => a.time.getTime() - b.time.getTime());
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    });
  }
}
