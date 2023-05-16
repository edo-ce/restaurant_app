import mongoose = require('mongoose');
import * as user from './model/User';
import * as table from './model/Table';
import * as dish from './model/Dish';

import http = require('http');
import https = require('https');
import colors = require('colors');
colors.enabled = true;

import express = require('express');
import passport = require('passport');           // authentication middleware for Express
import passportHTTP = require('passport-http');  // implements Basic and Digest authentication for HTTP (used for /login endpoint)
import jsonwebtoken = require('jsonwebtoken');  // JWT generation
const { expressjwt: jwt } = require('express-jwt');            // JWT parsing middleware for express
import cors = require('cors');                  // Enable CORS middleware
//const io = require('socket.io');               // Socket.io websocket library


// TODO: check this code about .env
const result = require('dotenv').config();
if (result.error) {
  console.log("Unable to load \".env\" file. Please provide one to store the JWT secret key");
  process.exit(-1);
}
if( !process.env.JWT_SECRET ) {
  console.log("\".env\" file loaded but JWT_SECRET=<secret> key-value pair was not found");
  process.exit(-1);
}

declare global {
    namespace Express {
        interface User {
            username: string,
            name: string,
            surname: string,
            role: string,
            id: string
        }

        interface Request {
            auth: {
                username: string
            }
        }
    }
}

let app = express();

// authenticathion middleware using jwt
let auth = jwt( {
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
});

// add CORS middleware
app.use(cors());

// add express requests json handler middleware
app.use(express.json());

// add new request middleware
app.use((req, res, next) => {
    console.log("------------------------------------------------".inverse);
    console.log("New request for: " + req.url);
    console.log("Method: " + req.method);
    next();
});

// APIs

app.get("/", (req, res) => {
    res.status(200).json({api_version: "1.0", endpoints: ["/login", "/signup", "/users"]});
});

// get all the users
app.get("/users", auth, (req, res, next) => {
    user.getModel().find({}, {digest: 0, salt: 0}).then((users) => {
        return res.status(200).json(users);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
});

// TODO: see if needed or if only admin can read it
// TODO: check if username is wrong so no user is queried
// get the user with username specified in the request
app.get("/users/:username", auth, (req, res, next) => {
    user.getModel().findOne({username: req.params.username}, {digest: 0, salt: 0}).then((user) => {
        return res.status(200).json(user);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
});



// HTTP basic authentication strategy using passport middleware
passport.use(new passportHTTP.BasicStrategy(
    function(username: string, password: string, done) {
        user.getModel().findOne({username: username}, (err, user) => {
            if (err)
                return done({statusCode: 500, error: true, errormessage: err});

            if (!user)
                return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"});

            if (user.checkPassword(password))
                return done(null, user);

            return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"});
        })
    }
));

app.get("/login", passport.authenticate("basic", {session: false}), (req, res, next) => {
    let tokendata = {
        username: req.user.username,
        name: req.user.name,
        surname: req.user.surname,
        role: req.user.role,
        id: req.user.id
    };

    console.log("Login granted. Generating token" );
    let token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, { expiresIn: '6h' } );

    return res.status(200).json({ error: false, errormessage: "", token: token_signed });
});


// add error handler middleware
app.use((err,req,res,next) => {
    console.log("Request error: ".red + JSON.stringify(err) );
    res.status( err.statusCode || 500 ).json( err );
});

// add error 404 middleware
app.use((req,res,next) => {
    res.status(404).json({statusCode:404, error:true, errormessage: "Invalid endpoint"} );
});


// aux function to retrieve data from a json file
const retrieveData = (data: [Object], type) => {
    let ans = [];
    data.forEach((elem) => {
        ans.push(type.getModel().create(elem));
    });
    return ans;
}


// Connect to DB using Mongoose
mongoose.connect(`mongodb+srv://edo:${process.env.MONGO_PWD}@cluster0.xehvg80.mongodb.net/?retryWrites=true&w=majority`)
.then(
    () => {
        console.log("Connected to MongoDB");
        return user.getModel().findOne({username: "admin"});
    }
).then(
    (admin) => {
        if (!admin) {
            console.log("Creating admin user");
            let a = user.newUser({
                username: "admin",
                name: "admin",
                surname: "admin"
            });
            a.setAdmin();
            a.setPassword("admin");
            return a.save();
        } else {
            console.log("Admin already exists");
        }
    }
).then(
    () => {
        return dish.getModel().countDocuments({});
    }
).then(
    (count) => {
        if (count === 0) {
            // insert boostrap dishes
            console.log("Adding dishes on menu");
            let dishes = retrieveData(require('./util/dishes.json'), dish);
            return Promise.all(dishes);
        }
    }
).then(
    () => {
        return table.getModel().countDocuments({});
    }
).then(
    (count) => {
        if (count === 0) {
            // insert boostrap tables
            console.log("Adding tables");
            let tables = retrieveData(require('./util/tables.json'), table);
            return Promise.all(tables);
        }
    }
).then(
    () => {
        return user.getModel().countDocuments({});
    }
).then(
    (count) => {
        if (count === 1) {
            // insert bootstrap users
            console.log("Adding users");
            let users = retrieveData(require('./util/users.json'), user);
            return Promise.all(users);
        }
    }
).then(
    () => {
        let server = http.createServer(app);

        // initialize io server

        server.listen(8080, () => console.log("HTTP Server started on port 8080".green));
    }
).catch(
    (err) => {
        console.log("Error occurred during initialization".red);
        console.log(err);
    }
);