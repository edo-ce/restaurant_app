import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public errmessage = undefined;

  constructor(private router: Router, private http: UserHttpService) { }

  ngOnInit(): void {
      
  }

  login(username: string, password: string, remember: boolean): void {
    this.http.login(username, password, remember).subscribe({
      next: (d) => {
        console.log("Login granted: " + JSON.stringify(d));
        console.log("User service token: " + this.http.get_token());
        this.errmessage = undefined;
        this.router.navigate(["/private"]);
      },
      error: (err) => {
        console.log("Login error: " + JSON.stringify(err));
        this.errmessage = err.message;
      }
    })
  }
}
