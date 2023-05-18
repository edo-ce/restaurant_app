import mongoose = require('mongoose');

// TODO: add number of seats

export interface Table extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    number: number,
    occupied: boolean,
    seats: number,
    isFree: () => boolean,
    setFree: () => void,
    occupy: () => boolean
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
    seats: {
        type: mongoose.SchemaTypes.Number,
        required: true
    }
})

tableSchema.methods.isFree = function() {
    return this.occupied === false;
}

tableSchema.methods.setFree = function() {
    this.occupied = false;
}

// TODO: check if use the setter with a boolean parameter
tableSchema.methods.occupy = function() {
    if (!this.isFree())
        return false;
    this.occupy = true;
    return true;
}

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