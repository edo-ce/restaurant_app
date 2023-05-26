import { Component, OnInit } from '@angular/core';
import { Table } from '../model/Table';
import { TableHttpService } from '../table-http.service';

@Component({
  selector: 'app-cashier',
  templateUrl: './cashier.component.html',
  styleUrls: ['./cashier.component.css']
})
export class CashierComponent implements OnInit {

  public tables: Table[] = [];
  public cols_number: number[] = [0, 1, 2, 3];

  constructor(private ts: TableHttpService) { }

  ngOnInit(): void {
      this.get_tables();
  }

  public get_tables(): void {
    this.ts.get_tables().subscribe({
      next: (tables) => {
        this.tables = tables.sort((a, b) => a.number - b.number);
      },
      error: (err) => {}
    });
  }

  public get_tables_number(): number {
    return this.tables.length;
  }

  public change_table_state(number: number, occupied: boolean): void {
    this.ts.set_table(number, {'occupied': occupied});
  }
}
