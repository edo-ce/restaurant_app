import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TablesComponent } from './tables/tables.component';
import { StaffComponent } from './staff/staff.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProfileComponent } from './profile/profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GuardService } from './guard.service';

const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: LoginComponent},
  {path: "tables", component: TablesComponent, canActivate: [GuardService]},
  {path: "staff", component: StaffComponent, canActivate: [GuardService]},
  {path: "menu", component: MenuComponent, canActivate: [GuardService]},
  {path: "orders", component: OrdersComponent, canActivate: [GuardService]},
  {path: "orders/table/:number", component: OrdersComponent, canActivate: [GuardService]},
  {path: "order/table/:number", component: MenuComponent, canActivate: [GuardService]},
  {path: "statistics/:username", component: StatisticsComponent, canActivate: [GuardService]},
  {path: "statistics", component: StatisticsComponent, canActivate: [GuardService]},
  {path: "profile", component: ProfileComponent, canActivate: [GuardService]},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
