import mongoose = require('mongoose');

export interface Dish extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    name: string,
    type: string,
    price: number,
    ingredients: string[],
    checkIngredients: (ingredients: string[]) => boolean,
    isFood(): boolean
}

const dishSchema = new mongoose.Schema<Dish>({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    type: {
        type: mongoose.SchemaTypes.String,
        enum: ["food", "drink"],
        required: true
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    ingredients: {
        // TODO: required may be false
        type: [mongoose.SchemaTypes.String],
        required: true
    }
})

dishSchema.methods.checkIngredients = function(ingredients: string[]) {
    ingredients.forEach((ingredient: string) => {
        if (this.ingredients.includes(ingredient))
            return true;
    })
    return false;
}

dishSchema.methods.isFood = function() {
    return this.type === "FOOD";
}

export function getSchema() {
    return dishSchema;
}

let dishModel;

export function getModel(): mongoose.Model<Dish> {
    if(!dishModel)
        dishModel = mongoose.model('Dish', getSchema());
    return dishModel;
}

export function newDish(data): Dish {
    let _dishmodel = getModel();
    let dish = new _dishmodel(data);
    return dish;
}