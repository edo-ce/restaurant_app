import mongoose = require('mongoose');

export interface Table extends mongoose.Document {
    number: number,
    occupied: boolean,
    seats_capacity: number,
    seats_occupied: number,
}

const tableSchema = new mongoose.Schema<Table>({
    number: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        unique: true
    },
    occupied: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
        default: false
    },
    seats_capacity: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    seats_occupied: {
        type: mongoose.SchemaTypes.Number,
        required: true,
        default: 0
    }
})

export function getSchema() {
    return tableSchema;
}

let tableModel;

export function getModel(): mongoose.Model<Table> {
    if (!tableModel)
        tableModel = mongoose.model('Table', getSchema());
    return tableModel;
}

export function newTable(data): Table {
    let _tablemodel = getModel();
    let table = new _tablemodel(data);
    return table;
}

export function isTable(data): data is Table {
    console.log(data);
    return data && data.number && typeof(data.number) === "number" && 
    (!data.occupied || typeof(data.occupied) === "boolean") && 
    data.seats_capacity && typeof(data.seats_capacity) === "number";
}