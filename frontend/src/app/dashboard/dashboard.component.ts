import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private role: string = "";

  constructor(private us: UserHttpService) {}

  ngOnInit(): void {
    // set role from user http serrvice
    this.role = this.us.get_role();
  }

  get_role(): string {
    return this.role;
  }
}
