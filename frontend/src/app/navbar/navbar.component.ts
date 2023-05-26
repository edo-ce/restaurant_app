import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private role: string = "";

  constructor(private us: UserHttpService) {}

  ngOnInit(): void {
      this.role = this.us.get_role();
  }

  get_role(): string {
    return this.role;
  }
}
