import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { UserHttpService } from './user-http.service';
import { TableHttpService } from './table-http.service';
import { OrdersHttpService } from './orders-http.service';
import { DishHttpService } from './dish-http.service';
import { SocketioService } from './socketio.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CashierComponent } from './cashier/cashier.component';
import { WaiterComponent } from './waiter/waiter.component';
import { CookComponent } from './cook/cook.component';
import { BartenderComponent } from './bartender/bartender.component';
import { NavbarComponent } from './navbar/navbar.component';
import { StaffComponent } from './staff/staff.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  declarations: [
    // contains all the components
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CashierComponent,
    WaiterComponent,
    CookComponent,
    BartenderComponent,
    NavbarComponent,
    StaffComponent,
    OrdersComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {provide: UserHttpService, useClass: UserHttpService },
    {provide: TableHttpService, useClass: TableHttpService },
    {provide: OrdersHttpService, useClass: OrdersHttpService },
    {provide: DishHttpService, useClass: DishHttpService },
    {provide: SocketioService, useClass: SocketioService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
