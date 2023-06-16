import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from '../model/Table';
import { TableHttpService } from '../table-http.service';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';
import { StatisticsHttpService } from '../statistics-http.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

  public tables: Table[] = [];
  public cols_number: number[] = [0, 1, 2, 3];
  public new_table = {'number': 0, 'seats_capacity': 0};
  private curr_table: Table = {"number": 0, "occupied": true, "seats_capacity": 4, "seats_occupied": 4};
  errmessage: any = undefined;
  @ViewChild('seats_number') seatsNumberInput!: ElementRef;

  constructor(private ts: TableHttpService, private router: Router, private us: UserHttpService, private stats_service: StatisticsHttpService) { }

  ngOnInit(): void {
      this.get_tables();
      if (this.get_role() === 'waiter')
        this.cols_number = [0];
  }

  public get_tables(): void {
    this.ts.get_tables().subscribe({
      next: (tables) => {
        this.tables = tables.sort((a, b) => a.number - b.number);
      },
      error: (error) => {
        console.log('Error occured while getting: ' + error);
      }
    });
  }

  public get_tables_number(): number {
    return this.tables.length;
  }

  public update_table(data: any): void {
    if (data.seats_occupied < 1 || data.seats_occupied > this.get_curr_table().seats_capacity)
      return;
    this.ts.set_table(this.curr_table.number, data).subscribe( {
      next: () => {
      console.log('Table status changed');
      this.stats_service.update_statistic(this.us.get_username(), {'tables_opened': [this.curr_table.number, 1, +data.seats_occupied]}).subscribe( {
        next: () => {
        console.log('Statistics updated');
        window.location.reload();
      },
      error: (error) => {
        console.log('Error occurred while posting: ' + error);
      }});
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  public add_table(): void {
    this.ts.post_table(this.new_table).subscribe({
      next: (table) => {
        console.log('Table added:' + JSON.stringify(table));
        this.errmessage = undefined;
        window.location.reload();
      },
      error: (error) => {          
        this.errmessage = `Table ${this.new_table.number} already exists.`;
    }});
  }

  public delete_table(): void {
    this.ts.delete_table(this.curr_table.number).subscribe({
      next: () => {
        console.log('Table ' + this.curr_table.number + ' deleted');
        window.location.reload();
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error) );
      }
    })
  }

  public set_curr_table(table: Table): void {
    this.curr_table = table;
  }

  public get_curr_table(): Table {
    return this.curr_table;
  }

  public open_history() {
    this.router.navigate(["orders/table/" + this.curr_table.number]);
  }

  public get_role(): string {
    return this.us.get_role();
  }
}
