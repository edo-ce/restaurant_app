import { Component, OnInit } from '@angular/core';
import { Dish } from '../model/Dish';
import { DishHttpService } from '../dish-http.service';
import { ActivatedRoute } from '@angular/router';
import { TableHttpService } from '../table-http.service';
import { UserHttpService } from '../user-http.service';
import { OrdersHttpService } from '../orders-http.service';
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
  public seats_occupied = undefined;
  errmessage = undefined;

  constructor(private ds: DishHttpService, private ts: TableHttpService, private us: UserHttpService, 
    private os: OrdersHttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.get_menu();
    if (this.route.snapshot.paramMap.get('number'))
      this.get_table(this.route.snapshot.paramMap.get('number'));
  }

  private get_menu(): void {
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

  public string_to_ingredients(ingredients: string): string[] {
    return ingredients.split(',').map((ingredient) => {
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

  public add_dish(data: Dish): void {
    this.ds.post_dish(data).subscribe({
      next: (dish) => {
        console.log('Dish added:' + JSON.stringify(dish));
        this.errmessage = undefined;
      },
      error: (error) => {
        console.log('Posting error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
    }});
  }

  public delete_dish(name_dish: string): void {
    this.ds.delete_dish(name_dish).subscribe({
      next: () => {
        console.log('Dish ' + name_dish + ' deleted');
        this.curr_dish = '';
        this.errmessage = undefined;
      },
      error: (error) => {
        console.log('Delete error: ' + JSON.stringify(error.error.errormessage) );
        this.errmessage = error.error.errormessage || error.error.message;
      }
    })
  }

  public new_order(seats_added = null): void {
    // add the number of people if it is the first order
    if (this.table.seats_occupied === 0) {
      this.ts.set_table(this.table.number, {"seats_occupied": seats_added}).subscribe( {
        next: () => {
        console.log('Table seats occupied added');
      },
      error: (error) => {
        console.log('Error occurred while posting: ' + error);
      }});
    }

    let dishes: any = [];
    this.menu.forEach((dish_pair: any) => {
      if (dish_pair[1] > 0)
        dishes.push(dish_pair);
    })
 
    let data = {
      "creator_username": this.us.get_username(),
      "table_number": this.table.number,
      "dishes": dishes
    }

    if (data.dishes.length > 0) {
      this.os.post_order(data).subscribe({
        next: (order) => {
          console.log('Order added:' + JSON.stringify(order));
          this.errmessage = undefined;
          this.router.navigate(["orders/table/" + this.table.number]);
        },
        error: (error) => {
          console.log('Posting error: ' + JSON.stringify(error.error.errormessage) );
          this.errmessage = error.error.errormessage || error.error.message;
      }});
    } else {
      this.router.navigate(["orders/table/" + this.table.number]);
    }
  }
}
