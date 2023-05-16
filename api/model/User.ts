import mongoose = require('mongoose');
import crypto = require('crypto');

export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    username: string,
    name: string,
    surname: string,
    role: string, // make it an array like roles?
    salt: string,
    digest: string,
    setPassword: (password: string) => void,
    checkPassword: (password: string) => boolean,
    checkRole: (role: string) => boolean,
    setRole: (role: string) => void,
    isAdmin: () => boolean,
    setAdmin: () => void
}

const ADMIN: string = "cashier";

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

userSchema.methods.checkRole = function(role: string) {
    return this.role === role;
}

userSchema.methods.setRole = function(role: string) {
    this.role = role;
}

userSchema.methods.isAdmin = function() {
    return this.checkRole(ADMIN);
}

userSchema.methods.setAdmin = function() {
    this.setRole(ADMIN);
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