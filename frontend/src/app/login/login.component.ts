import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';
import { GuardService } from '../guard.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public login_data = {"username": "", "password": ""};
  public errmessage: any = undefined;

  constructor(private router: Router, private us: UserHttpService, private gs: GuardService) { }

  ngOnInit(): void {
    this.gs.check_token(this.us.dashboard_routes[this.us.get_role()]);
  }

  login(remember: boolean): void {
    this.us.login(this.login_data.username, this.login_data.password, remember).subscribe({
      next: (d) => {
        console.log("Login granted: " + JSON.stringify(d));
        console.log("User service token: " + this.us.get_token());
        this.errmessage = undefined;
        this.router.navigate([this.us.dashboard_routes[this.us.get_role()]]);
      },
      error: (err) => {
        this.errmessage = "Username or Password are wrong, please try again.";
      }
    })
  }
}
