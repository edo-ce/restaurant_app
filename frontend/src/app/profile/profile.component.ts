import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public pwd = {"password": ""};

  constructor(private us: UserHttpService) { }

  ngOnInit(): void {

  }

  public get_username(): string {
    return this.us.get_username();
  }

  public get_name(): string {
    return this.us.get_name();
  }

  public get_surname(): string {
    return this.us.get_surname();
  }

  public get_role(): string {
    return this.us.get_role();
  }

  public change_password(): void {
    this.us.update_user(this.pwd).subscribe({
      next: () => {
        console.log("Password updated");
        this.us.logout();
      },
      error: (error) => {
        console.log("Error occurred while posting: " + error);
      }
    });
  }
}
