import { Component, OnInit } from '@angular/core';
import { User } from '../model/User';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  public users: User[] = [];

  constructor(private us: UserHttpService) {}

  ngOnInit(): void {
      this.get_users();
      console.log("Utenti: " + this.users.length);
  }

  public get_users(): void {
    this.us.get_users().subscribe({
      next: (users) => {
        this.users = users.sort((a, b) => this.us.roles.indexOf(a.role) - this.us.roles.indexOf(b.role));
      },
      error: (err) => {console.log(err)}
    });
  }

  public get_username(): string {
    return this.us.get_username();
  }
}
