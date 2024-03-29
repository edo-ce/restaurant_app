import { Component, OnInit } from '@angular/core';
import { Dish } from '../model/Dish';
import { DishHttpService } from '../dish-http.service';
import { ActivatedRoute } from '@angular/router';
import { TableHttpService } from '../table-http.service';
import { UserHttpService } from '../user-http.service';
import { StatisticsHttpService } from '../statistics-http.service';
import { OrdersHttpService } from '../orders-http.service';
import { SocketioService } from '../socketio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public menu: any = [];
  private curr_dish: string = "";
  public table: any = undefined;
  public dish: Dish = {name: '', price: 0.1, ingredients: [], type: 'food'};
  errmessage: any = undefined;

  constructor(private ds: DishHttpService, private ts: TableHttpService, private us: UserHttpService, private ios: SocketioService, 
    private os: OrdersHttpService, private route: ActivatedRoute, private router: Router, private stats_service: StatisticsHttpService) { }

  ngOnInit(): void {
    this.get_socket_menu();
    this.get_menu();
    if (this.route.snapshot.paramMap.get('number'))
      this.get_table(this.route.snapshot.paramMap.get('number'));
  }

  private get_socket_menu(): void {
    this.ios.get_update('updateDishes').subscribe(() => {
      this.get_menu();
    });
  }

  private get_menu(): void {
    this.menu = [];
    this.ds.get_dishes().subscribe({
      next: (dishes) => {
        dishes.forEach((dish) => {
          this.menu.push([dish, 0]);
        });
      },
      error: (err) => {console.log(err);}
    });
  }

  private get_table(number: any): void {
    this.ts.get_table(number).subscribe({
      next: (table) => {
        this.table = table;
      },
      error: (err) => {console.log(err)}
    });
  }

  public ingredients_to_string(dish: Dish): string {
    return dish.ingredients.join(', ');
  }

  public string_to_ingredients(ingredients: any): string[] {
    if (Array.isArray(ingredients))
      return [];
    return ingredients.toString().split(',').map((ingredient: string) => {
      return ingredient.trim();
    });
  }

  public get_curr_dish(): string {
    return this.curr_dish;
  }

  public set_curr_dish(name_dish: string): void {
    this.curr_dish = name_dish;
  }

  public change_amount(sign: string, name: string): void {
    this.menu.forEach((dish_pair: any) => {
      if (dish_pair[0].name === name) {
        if (sign === "plus")
          dish_pair[1]++;
        else if (dish_pair[1] > 0)
          dish_pair[1]--;
      }
    })
  }

  public add_dish(): void {
    if (this.dish.price <= 0)
      return;
    this.dish.ingredients = this.string_to_ingredients(this.dish.ingredients);
    this.ds.post_dish(this.dish).subscribe({
      next: (dish) => {
        console.log('Dish added:' + JSON.stringify(dish));
        this.errmessage = undefined;
        window.location.reload();
      },
      error: (error) => {
        this.errmessage = `Dish ${this.dish.name} already exists.`;
    }});
  }

  public delete_dish(name_dish: string): void {
    this.ds.delete_dish(name_dish).subscribe({
      next: () => {
        console.log('Dish ' + name_dish + ' deleted');
        this.curr_dish = '';
        this.errmessage = undefined;
        window.location.reload();
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
      }
    })
  }

  public new_order(): void {
    let food_dishes: any = [];
    let drink_dishes: any = [];
    this.menu.forEach((dish_pair: any) => {
      if (dish_pair[1] > 0) {
        if (dish_pair[0].type === 'food')
          food_dishes.push(dish_pair);
        else
          drink_dishes.push(dish_pair);
      }
    })
 
    let food_data = {
      "creator_username": this.us.get_username(),
      "table_number": this.table.number,
      "type": "food",
      "dishes": food_dishes
    }

    let drink_data = {
      "creator_username": this.us.get_username(),
      "table_number": this.table.number,
      "type": "drink",
      "dishes": drink_dishes
    }

    if (food_dishes.length > 0 && drink_dishes.length > 0)
      this.add_order(food_data, drink_data);
    else if (food_dishes.length > 0)
      this.add_order(food_data);
    else if (drink_dishes.length > 0)
      this.add_order(drink_data);
    else
      this.router.navigate(["orders/table/" + this.table.number]);
  }

  private add_order(data1: Object, data2: any = null): void {
    this.os.post_order(data1).subscribe({
      next: (order) => {
        this.errmessage = undefined;
        if (data2) {
          this.os.post_order(data2).subscribe({
            next: (order) => {
              this.add_statistics("orders/table/" + this.table.number, 2);
            }
          });
        } else {
          this.add_statistics("orders/table/" + this.table.number, 1);
        }
      },
      error: (error) => {
        console.log('Posting error: ' + JSON.stringify(error.error.errormessage));
        this.errmessage = error.error.errormessage || error.error.message;
    }});
  }

  private add_statistics(route: string, num: number) {
    this.stats_service.update_statistic(this.us.get_username(), {'num_orders': num}).subscribe( {
      next: () => {
      console.log('Statistics updated');
      this.router.navigate([route]);
    },
    error: (error) => {
      console.log('Error occurred while posting: ' + error);
    }});
  }

  public get_role(): string {
    return this.us.get_role();
  }
}
