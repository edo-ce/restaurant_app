import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from '../model/Table';
import { TableHttpService } from '../table-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {

  public tables: Table[] = [];
  public cols_number: number[] = [0, 1, 2, 3];
  private curr_table: Table = {"number": 0, "occupied": true, "seats_capacity": 4, "seats_occupied": 4};
  @ViewChild('seats_number') seatsNumberInput!: ElementRef;

  constructor(private ts: TableHttpService, private router: Router) { }

  ngOnInit(): void {
      this.get_tables();
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
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
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
}
