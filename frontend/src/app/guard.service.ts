import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { UserHttpService } from './user-http.service';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate {
  
  private static routes: any = {
    'cashier': ['tables', 'staff', 'menu', 'statistics', 'orders', 'order', 'profile'],
    'waiter': ['tables', 'menu', 'profile'],
    'cook': ['orders', 'menu', 'profile'],
    'bartender': ['orders', 'menu', 'profile']
  }

  constructor(private router: Router, private us: UserHttpService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (state.url !== '/login' && this.us.get_token() === "") {
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
