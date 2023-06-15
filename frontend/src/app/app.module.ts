import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { UserHttpService } from './user-http.service';
import { TableHttpService } from './table-http.service';
import { OrdersHttpService } from './orders-http.service';
import { DishHttpService } from './dish-http.service';
import { StatisticsHttpService } from './statistics-http.service';
import { SocketioService } from './socketio.service';
import { GuardService } from './guard.service';
import { JwtHelperService, JWT_OPTIONS   } from '@auth0/angular-jwt';
import { TablesComponent } from './tables/tables.component';
import { NavbarComponent } from './navbar/navbar.component';
import { StaffComponent } from './staff/staff.component';
import { OrdersComponent } from './orders/orders.component';
import { MenuComponent } from './menu/menu.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    // contains all the components
    AppComponent,
    LoginComponent,
    TablesComponent,
    NavbarComponent,
    StaffComponent,
    OrdersComponent,
    MenuComponent,
    StatisticsComponent,
    PageNotFoundComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {provide: UserHttpService, useClass: UserHttpService },
    {provide: TableHttpService, useClass: TableHttpService },
    {provide: OrdersHttpService, useClass: OrdersHttpService },
    {provide: DishHttpService, useClass: DishHttpService },
    {provide: StatisticsHttpService, useClass: StatisticsHttpService },
    {provide: SocketioService, useClass: SocketioService },
    {provide: GuardService, useClass: GuardService },
    {provide: JwtHelperService, useClass: JwtHelperService },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
