import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { UserHttpService } from './user-http.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate, OnInit {
  
  private static routes: any = {
    'cashier': ['tables', 'staff', 'menu', 'statistics', 'orders', 'profile'],
    'waiter': ['tables', 'menu', 'profile', 'orders', 'order'],
    'cook': ['orders', 'menu', 'profile'],
    'bartender': ['orders', 'menu', 'profile']
  }
  public token_valid: boolean = false;

  constructor(private router: Router, private us: UserHttpService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (state.url !== '/login' && this.us.get_token() === '') {
      this.router.navigate(['login']);
      return false;
    }

   if (state.url !== '/login' && !GuardService.routes[this.us.get_role()].includes(state.url.split('/')[1])) {
      this.router.navigate(['**']);
      return false;
   }

    return true;
  }
}
