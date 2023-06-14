import mongoose = require('mongoose');

export interface Dish extends mongoose.Document {
    name: string,
    type: string,
    price: number,
    ingredients: string[],
    checkIngredients: (ingredients: string[]) => boolean,
    isFood(): boolean
}

const TYPE_ENUM: string[] = ["food", "drink"];

const dishSchema = new mongoose.Schema<Dish>({
    name: {
        type: mongoose.SchemaTypes.String,
        unique: true,
        required: true
    },
    type: {
        type: mongoose.SchemaTypes.String,
        enum: TYPE_ENUM,
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

export function isDish(data): data is Dish {
    console.log(data);
    return data && data.name && typeof(data.name) === "string" && 
    data.type && TYPE_ENUM.includes(data.type) && 
    data.price && typeof(data.price) === "number" && 
    data.ingredients && Array.isArray(data.ingredients)
}