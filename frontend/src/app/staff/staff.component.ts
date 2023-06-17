import { Component, OnInit } from '@angular/core';
import { User, isUser } from '../model/User';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  public user: any = {username: '', password: '', name: '', surname: '', role: ''};
  public users: User[] = [];
  private curr_user: string = '';
  errmessage: any = undefined;

  constructor(private us: UserHttpService, private router: Router, private ios: SocketioService) {}

  ngOnInit(): void {
    this.get_socket_staff();
    this.get_users();
  }

  private get_socket_staff(): void {
    this.ios.get_update('updateUsers').subscribe(() => {
      this.get_users();
    });
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

  public add_user(): void{
    if (this.user.password === undefined || this.user.password === "") {
      this.errmessage = `You need to insert every information.`;
      return;
    }
    
    this.us.post_user(this.user).subscribe({
      next: (user) => {
        console.log('User added:' + JSON.stringify(user));
        this.errmessage = undefined;
        window.location.reload();
      },
      error: (error) => {          
        this.errmessage = `User ${this.user.username} already exists.`;
    }});
  }

  public delete_user(username: string): void {
    this.us.delete_user(username).subscribe({
      next: () => {
        console.log('User ' + username + ' deleted');
        this.curr_user = '';
        this.errmessage = undefined;
        window.location.reload();
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error) );
      }
    })
  }

  public set_curr_user(username: string): void {
    this.curr_user = username;
  }

  public get_curr_user(): string {
    return this.curr_user;
  }

  public open_statistics(username: string): void {
    this.router.navigate(["/statistics/"+username]);
  }
}
