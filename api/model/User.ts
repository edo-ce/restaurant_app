import mongoose = require('mongoose');
import crypto = require('crypto');

export interface User extends mongoose.Document {
    username: string,
    name: string,
    surname: string,
    role: string,
    salt: string,
    digest: string,
    setPassword: (password: string) => void,
    checkPassword: (password: string) => boolean,
    isAdmin: () => boolean,
    setAdmin: () => void
}

const ADMIN: string = "cashier";
const ROLES: string[] = ["cashier", "waiter", "bartender", "cook"];

const userSchema = new mongoose.Schema<User>({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    name: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    surname: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    role:  {
        type: mongoose.SchemaTypes.String,
        enum: ["cashier", "waiter", "bartender", "cook"],
        required: true
    },
    salt:  {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest:  {
        type: mongoose.SchemaTypes.String,
        required: false
    }
})

userSchema.methods.setPassword = function(password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');

    // apply the sha512 algorithm with the random salt
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(password);
    // compute the digest from the password and the digest
    this.digest = hmac.digest('hex');
}

userSchema.methods.checkPassword = function(password: string) {
    const hmac = crypto.createHmac('sha512', this.salt);
    hmac.update(password);
    const digest = hmac.digest('hex');
    return this.digest === digest;
}

userSchema.methods.isAdmin = function() {
    return this.role === ADMIN;
}

userSchema.methods.setAdmin = function() {
    this.role = ADMIN;
}

export function getSchema() {
    return userSchema;
}

let userModel;

export function getModel(): mongoose.Model<User> {
    if (!userModel)
        userModel = mongoose.model('User', getSchema());
    return userModel;
}

export function newUser(data): User {
    let _usermodel = getModel();
    let user = new _usermodel(data);
    return user;
}

export function isUser(data): data is User {
    return data && data.username && typeof(data.username) === "string" && 
    data.name && typeof(data.name) === "string" && 
    data.surname && typeof(data.surname) === "string" && 
    data.role && typeof(data.role) === "string" && ROLES.includes(data.role);
}