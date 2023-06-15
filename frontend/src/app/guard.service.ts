import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { UserHttpService } from './user-http.service';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate {
  
  private static routes: any = {
    'cashier': ['tables', 'staff', 'menu', 'statistics', 'orders', 'profile'],
    'waiter': ['tables', 'menu', 'profile', 'orders', 'order'],
    'cook': ['orders', 'menu', 'profile'],
    'bartender': ['orders', 'menu', 'profile']
  }

  constructor(private router: Router, private us: UserHttpService, private http: HttpClient, private jhs: JwtHelperService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (state.url !== '/login' && this.jhs.isTokenExpired(this.us.get_token())) {
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
