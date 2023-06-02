import { Component, OnInit } from '@angular/core';
import { Dish } from '../model/Dish';
import { DishHttpService } from '../dish-http.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public menu: Dish[] = [];
  private curr_dish: string = "";
  errmessage = undefined;

  constructor(private ds: DishHttpService) { }

  ngOnInit(): void {
    this.get_menu();  
  }

  private get_menu(): void {
    this.ds.get_dishes().subscribe({
      next: (dishes) => {
        this.menu = dishes;
      },
      error: (err) => {console.log(err);}
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
}
