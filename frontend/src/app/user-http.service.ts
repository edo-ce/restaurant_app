import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { User } from './model/User';
import { Router } from '@angular/router';

interface TokenData {
  username: string,
  name: string,
  surname: string,
  role: string
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
  public roles: string[] = ["cashier", "cook", "bartender", "waiter"];
  public dashboard_routes: any = {"cashier": "/tables", "waiter": "/tables", "cook": "/orders", "bartender": "/orders"};

  constructor(private http: HttpClient, private router: Router) {
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

  public create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };
  }

  public handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }

    return throwError(() => new Error('Something bad happened; please try again later.') );
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
    this.router.navigate(["/"]);
  }

  get_token(): string {
    return this.token;
  }

  get_username(): string {
    return (jwt_decode(this.token) as TokenData).username;
  }
  
  get_name(): string {
    return (jwt_decode(this.token) as TokenData).name;
  }

  get_surname(): string {
    return (jwt_decode(this.token) as TokenData).surname;
  }

  get_role(): string {
    return (jwt_decode(this.token) as TokenData).role;
  }

  is_admin(): boolean {
    return (jwt_decode(this.token) as TokenData).role === UserHttpService.ADMIN;
  }

  get_users(): Observable<User[]> {
    return this.http.get<User[]>(this.url + '/users', this.create_options({})).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
      }),
      catchError(this.handleError)
    );
  }

  get_user(username: string): Observable<User> {
    return this.http.get<User>(this.url + '/users/' + username, this.create_options({})).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
      }),
      catchError(this.handleError)
    )
  }

  post_user(data: any): Observable<User> {
    return this.http.post<User>(this.url + '/users', data, this.create_options()).pipe(
      catchError(this.handleError)
    );
  }

  delete_user(username: string): Observable<User> {
    return this.http.delete<User>(this.url + '/users/' + username, this.create_options()).pipe(
      catchError(this.handleError)
    );
  }

  update_user(data: Object): Observable<User> {
    return this.http.post<User>(this.url + '/users/' + this.get_username(), data, this.create_options({})).pipe(
      catchError(this.handleError)
    )
  }
}
