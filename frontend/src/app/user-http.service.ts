import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import jwt_decode from "jwt-decode";

interface TokenData {
  username: string,
  name: string,
  surname: string,
  role: string,
  id: string
}

interface ReceivedToken {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class UserHttpService {

  private token: string = "";
  private static ADMIN: string = "cashier";
  public url = "http://localhost:8080";

  constructor(private http: HttpClient) {
    console.log("User service instantiated");

    const localtoken = localStorage.getItem("restaurant_app_token");
    if (!localtoken || localtoken.length < 1) {
      console.log("No token found in local storage");
      this.token = "";
    } else {
      this.token = localtoken as string;
      console.log("JWT loaded from local storage");
    }
  }

  login(username: string, password: string, remember: boolean): Observable<any> {
    console.log(`Login ${username} ${password}`);

    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa(`${username}:${password}`),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };

    return this.http.get(this.url+"/login", options).pipe(
      tap((data) => {
        console.log(JSON.stringify(data));
        this.token = (data as ReceivedToken).token;
        if (remember)
          localStorage.setItem("restaurant_app_token", this.token as string);
      })
    );
  }

  logout(): void {
    console.log("Logging out");
    this.token = "";
    localStorage.setItem("restaurant_app_token", this.token);
  }

  get_token(): string {
    return this.token;
  }

  get_username(): string {
    return (jwt_decode(this.token) as TokenData).username;
  }

  get_id(): string {
    return (jwt_decode(this.token) as TokenData).id;
  }

  is_admin(): boolean {
    return (jwt_decode(this.token) as TokenData).role === UserHttpService.ADMIN;
  }
}
