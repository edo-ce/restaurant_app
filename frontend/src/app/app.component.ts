import { Component, OnInit } from '@angular/core';
import { SocketioService } from './socketio.service';
import { UserHttpService } from './user-http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "frontend";
  public message: any = undefined;
  public alert_type = 'primary';

  constructor(private ios: SocketioService, private us: UserHttpService) { }

  ngOnInit(): void {
      this.get_socket();
  }

  private get_socket(): void {
    if (this.us.get_role() === 'cook') {
      this.ios.get_update('cooks').subscribe((msg: any) => {
        this.activateAlert(msg);
      });
    } else if (this.us.get_role() === 'bartender') {
      this.ios.get_update('bartenders').subscribe((msg: any) => {
        this.activateAlert(msg);
      });
    } else if (this.us.get_role() === 'waiter') {
      this.ios.get_update(this.us.get_username()).subscribe((msg: any) => {
        this.activateAlert(msg);
      });
    }
  }

  private activateAlert(msg: string): void {
    if (this.us.get_role() === 'waiter' && msg.split(" ")[msg.split(" ").length-1] === 'served')
      this.alert_type = 'success';
    else
      this.alert_type = 'primary';

      this.message = msg;
    
    setTimeout(() => {
      this.message = undefined;
    }, 3000);
  }
}
