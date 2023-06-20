import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserHttpService } from './user-http.service';
import { io } from "socket.io-client";
import { Order } from './model/Order';
import { Table } from './model/Table';

@Injectable()
export class SocketioService {

  private socket: any;

  constructor(private us: UserHttpService) { }

  connect() {
    this.socket = io(this.us.url);
  }

  get_update(msg: string) {
    this.connect();

    return new Observable((observer) => {
      this.socket.on(msg, (data: any) => {
        observer.next(data);
      });

      this.socket.on('error', (err: any) => {
        console.log('Socket.io error: ' + err);
        observer.error(err);
      });
    });
  }
}