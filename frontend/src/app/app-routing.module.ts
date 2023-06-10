import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TablesComponent } from './tables/tables.component';
import { StaffComponent } from './staff/staff.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: LoginComponent},
  {path: "dashboard", component: DashboardComponent, children: [
    // TODO: check only cashier
    
  ]},
  {path: "staff", component: StaffComponent},
  {path: "menu", component: MenuComponent},
  {path: "orders/table/:number", component: OrdersComponent},
  {path: "order/table/:number", component: MenuComponent},
  {path: "statistics/:username", component: StatisticsComponent},
  {path: "statistics", component: StatisticsComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
