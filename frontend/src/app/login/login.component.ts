import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public login_data = {"username": "", "password": ""};
  public errmessage: any = undefined;

  constructor(private router: Router, private us: UserHttpService) { }

  ngOnInit(): void {
      if (this.us.get_token())
        this.router.navigate(["tables"]);
  }

  login(remember: boolean): void {
    this.us.login(this.login_data.username, this.login_data.password, remember).subscribe({
      next: (d) => {
        console.log("Login granted: " + JSON.stringify(d));
        console.log("User service token: " + this.us.get_token());
        this.errmessage = undefined;
        this.router.navigate(["tables"]);
      },
      error: (err) => {
        this.errmessage = "Username or Password are wrong, please try again.";
      }
    })
  }
}
