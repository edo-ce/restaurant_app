import { Dish } from "./Dish"

export interface Order {
    _id: string,
    time: Date,
    status: string,
    creator_username: string,
    table_number: number,
    dishes: [Dish, number][]
}