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
  private curr_user: string = '';
  errmessage = undefined;

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

  public add_user(data: User): void{
    this.us.post_user(data).subscribe({
      next: (user) => {
        console.log('User added:' + JSON.stringify(user));
        this.errmessage = undefined;
      },
      error: (error) => {
        console.log('Posting error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
    }});
  }

  public delete_user(username: string): void {
    this.us.delete_user(username).subscribe({
      next: () => {
        console.log('User ' + username + ' deleted');
        this.curr_user = '';
        this.errmessage = undefined;
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
      }
    })
  }

  public set_curr_user(username: string): void {
    this.curr_user = username;
  }

  public get_curr_user(): string {
    return this.curr_user;
  }
}
