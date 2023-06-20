import mongoose = require('mongoose');

export interface Statistic extends mongoose.Document {
    username: string,
    num_orders: number, // how many orders served/prepared/checked out
    num_services: number, // how many work days
    dishes_prepared: [string, number][], // name of dish and amount prepared
    tables_opened: [number, number, number][], // number of table, how many times opened and number of people
    tables_closed: [number, number, number][], // number of table, how many times closed, and total amount spent
    total_revenue: number
}

const tableSchema = new mongoose.Schema<Statistic>({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    num_orders: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        default: 0
    },
    num_services: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        default: 0
    },
    dishes_prepared: {
        type: [[mongoose.SchemaTypes.String, mongoose.SchemaTypes.Number]],
        required: false
    },
    tables_opened: {
        type: [[mongoose.SchemaTypes.Number, mongoose.SchemaTypes.Number]],
        required: false
    },
    tables_closed: {
        type: [[mongoose.SchemaTypes.Number, mongoose.SchemaTypes.Number, mongoose.SchemaTypes.Number]],
        required: false
    },
    total_revenue: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        default: 0
    }
})

export function getSchema() {
    return tableSchema;
}

let tableModel;

export function getModel(): mongoose.Model<Statistic> {
    if (!tableModel)
        tableModel = mongoose.model('Statistic', getSchema());
    return tableModel;
}

export function newStatistic(data): Statistic {
    let _statisticmodel = getModel();
    let stat = new _statisticmodel(data);
    return stat;
}

export function isStatistic(data): data is Statistic {
    return data && data.username && typeof(data.username) === "string" && 
    data.num_orders && typeof(data.num_orders) === "number" && 
    data.num_services && typeof(data.num_services) === "number"
}