import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CashierComponent } from './cashier/cashier.component';
import { WaiterComponent } from './waiter/waiter.component';
import { CookComponent } from './cook/cook.component';
import { BartenderComponent } from './bartender/bartender.component';
import { StaffComponent } from './staff/staff.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: LoginComponent},
  {path: "dashboard", component: DashboardComponent, children: [
    // TODO: check only cashier
    
  ]},
  {path: "staff", component: StaffComponent},
  {path: "menu", component: MenuComponent},
  {path: "orders/:model/:parameter", component: OrdersComponent},
  {path: "order/table/:number", component: MenuComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
