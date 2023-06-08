import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private role: string = "";
  private curr_route: string = "dashboard";

  constructor(private us: UserHttpService, private router: Router) {}

  ngOnInit(): void {
      this.role = this.us.get_role();
  }

  get_role(): string {
    return this.role;
  }

  set_route(route: string): void {
    this.curr_route = route;
    console.log(this.curr_route);
  }

  check_route(route: string): boolean {
    return this.curr_route === route;
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }
}
