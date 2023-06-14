import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';
import { GuardService } from '../guard.service';
import { StatisticsHttpService } from '../statistics-http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public login_data = {"username": "", "password": ""};
  public errmessage: any = undefined;

  constructor(private router: Router, private us: UserHttpService, private gs: GuardService, private stats_service: StatisticsHttpService) { }

  ngOnInit(): void {
    if (this.us.get_token() !== '')
      this.router.navigate([this.us.dashboard_routes[this.us.get_role()]]);
  }

  login(remember: boolean): void {
    this.us.login(this.login_data.username, this.login_data.password, remember).subscribe({
      next: (d) => {
        console.log("Login granted: " + JSON.stringify(d));
        console.log("User service token: " + this.us.get_token());
        this.errmessage = undefined;

        // update user statistics adding 1 to the number of services
        this.stats_service.update_statistic(this.us.get_username(), {'num_services': 1}).subscribe( {
          next: () => {
          console.log('Statistics updated');
          this.router.navigate([this.us.dashboard_routes[this.us.get_role()]]);
        },
        error: (error) => {
          console.log('Error occurred while posting: ' + error);
        }});
      },
      error: (err) => {
        this.errmessage = "Username or Password are wrong, please try again.";
      }
    })
  }
}
