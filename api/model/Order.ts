import mongoose = require('mongoose');
import { Dish, isDish } from './Dish';

export interface Order extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    time: Date,
    status: string,
    creator_username: string,
    table_number: number,
    type: string,
    dishes: [Dish, number][]
}

const STATUS_ENUM: string[] = ["todo", "in progress", "to serve", "done"];
const TYPE_ENUM: string[] = ["food", "drink"];

const orderSchema = new mongoose.Schema<Order>({
    time: {
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date()
    },
    status: {
        type: mongoose.SchemaTypes.String,
        required: true,
        enum: STATUS_ENUM,
        default: "todo"
    },
    creator_username: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    table_number: {
        type: mongoose.Schema.Types.Number,
        required: true
    },
    type: {
        type: mongoose.Schema.Types.String,
        required: true,
        enum: TYPE_ENUM
    },
    dishes: {
        type: [[mongoose.Schema.Types.Mixed, mongoose.SchemaTypes.Number]],
        required: true
    }
})

export function getSchema() {
    return orderSchema;
}

let orderModel;

export function getModel(): mongoose.Model<Order> {
    if(!orderModel)
        orderModel = mongoose.model('Order', getSchema());
    return orderModel;
}

export function newOrder(data): Order {
    let _ordermodel = getModel();
    let order = new _ordermodel(data);
    return order;
}

export function isOrder(data): data is Order {
    return data && (!data.time || data.time instanceof Date) &&
    (!data.status || STATUS_ENUM.includes(data.status)) && 
    data.creator_username && typeof(data.creator_username) === "string" && 
    data.table_number && typeof(data.table_number) === "number" && 
    data.type && TYPE_ENUM.includes(data.type) && 
    data.dishes.every((dish_pair) => isDish(dish_pair[0]) && typeof(dish_pair[1]) === "number");
}