import mongoose = require('mongoose');
import * as user from './model/User';
import * as table from './model/Table';
import * as dish from './model/Dish';
import * as order from './model/Order';

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
const io = require('socket.io');               // Socket.io websocket library


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
            role: string
        }

        interface Request {
            auth: {
                username: string
            }
        }
    }
}

let ios = undefined;
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

// middleware to check if a user is an admin
const checkAdminRole = (req, res, next) => {
    user.getModel().findOne({username: req.auth.username}).then((user) => {
        if (!user.isAdmin())
            return res.status(404).json( {error:true, errormessage:"Unauthorized: user is not an admin"} );
        next();
    }).catch((reason) => {
        return res.status(404).json( {error:true, errormessage:"DB error: " + reason} );
    });
};

// APIs

app.get("/", (req, res) => {
    res.status(200).json({api_version: "1.0", endpoints: ["/login", "/users", "/statistics"]});
});

// TODO: check if only admin can see them
// get all the users or add a new one
app.route("/users").get(auth, (req, res, next) => {
    user.getModel().find({}, {digest: 0, salt: 0}).then((users) => {
        return res.status(200).json(users);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).post(auth, checkAdminRole, (req, res, next) => {
    if (req.body.password !== '' && !req.body.password)
        return next({ statusCode:404, error: true, errormessage: "Password field is missing" });

    let password = req.body.password;
    delete req.body.password;
    let newUser = req.body;
    if (user.isUser(newUser)) {
        // TODO: check if username already exists
        let newUser = user.newUser(req.body);
        newUser.setPassword(password);
        newUser.save().then((user) => {
            return res.status(200).json(user);
        }).catch((reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });
    } else {
        return next({ statusCode:404, error: true, errormessage: "Data is not a valid User" });
    }
});

// TODO: see if needed or if only admin can read it
// TODO: check if username is wrong so no user is queried
// get or delete the user with username specified in the request
app.route("/users/:username").get(auth, checkAdminRole, (req, res, next) => {
    user.getModel().findOne({username: req.params.username}, {digest: 0, salt: 0}).then(
        (user) => {
            if (user)
                return res.status(200).json(user);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid username"} );
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).delete(auth, checkAdminRole, (req, res, next) => {
    user.getModel().deleteOne({username: req.params.username}).then(
        (query) => {
            if (query.deletedCount > 0)
                return res.status(200).json( {error:false, errormessage:""} );
            else
                return res.status(404).json( {error:true, errormessage:"Invalid username"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
});

// get all the dishes or add a new dish
app.route("/dishes").get(auth, (req, res, next) => {
    dish.getModel().find({}).then((dishes) => {
        return res.status(200).json(dishes);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).post(auth, checkAdminRole, (req, res, next) => {
    let newDish = req.body;
    if (dish.isDish(newDish)) {
        dish.getModel().create(newDish).then((dish) => {
            return res.status(200).json(dish);
        }).catch((reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });
    } else {
        return next({ statusCode:404, error: true, errormessage: "Data is not a valid Dish" });
    }
});

// get or delete a dish from the menu
app.route("/dishes/:name").get(auth, (req, res, next) => {
    dish.getModel().findOne({name: req.params.name}, {}).then(
        (dish) => {
            if (dish)
                return res.status(200).json(dish);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid dish name"} );
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).delete(auth, checkAdminRole, (req, res, next) => {
    dish.getModel().deleteOne({name: req.params.name}).then(
        (query) => {
            if (query.deletedCount > 0)
                return res.status(200).json( {error:false, errormessage:""} );
            else
                return res.status(404).json( {error:true, errormessage:"Invalid dish name"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}).post(auth, checkAdminRole, (req, res, next) => {
    dish.getModel().updateOne({name: req.params.name}, req.body).then(
        (updated) => {
            if (updated.acknowledged)
                return res.status(200).json(updated);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid updating data"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    });
});

// get all the tables or add a new table
app.route("/tables").get(auth, (req, res, next) => {
    table.getModel().find({}).then((tables) => {
        return res.status(200).json(tables);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).post(auth, checkAdminRole, (req, res, next) => {
    let newTable = req.body;
    if (table.isTable(newTable)) {
        table.getModel().create(newTable).then((table) => {
            return res.status(200).json(table);
        }).catch((reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });
    } else {
        return next({ statusCode:404, error: true, errormessage: "Data is not a valid Table" });
    }
});

// get or delete or update a table
app.route("/tables/:number").get(auth, (req, res, next) => {
    table.getModel().findOne({number: req.params.number}, {}).then(
        (table) => {
            if (table)
                return res.status(200).json(table);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid table number"} );
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).delete(auth, checkAdminRole, (req, res, next) => {
    table.getModel().deleteOne({number: req.params.number}).then(
        (query) => {
            if (query.deletedCount > 0)
                return res.status(200).json( {error:false, errormessage:""} );
            else
                return res.status(404).json( {error:true, errormessage:"Invalid table number"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}).post(auth, checkAdminRole, (req, res, next) => {
    table.getModel().updateOne({number: req.params.number}, req.body).then(
        (updated) => {
            if (updated.acknowledged)
                return res.status(200).json(updated);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid updating data"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    });
});

// get all the orders or add a new order
app.route("/orders").get(auth, (req, res, next) => {
    order.getModel().find({}).then((orders) => {
        return res.status(200).json(orders);
    }).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).post(auth, checkAdminRole, (req, res, next) => {
    let newOrder = req.body;
    if (order.isOrder(newOrder)) {
        order.getModel().create(newOrder).then((order) => {
            ios.emit('broadcast', order);
            return res.status(200).json(order);
        }).catch((reason) => {
            return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
        });
    } else {
        return next({ statusCode:404, error: true, errormessage: "Data is not a valid Order" });
    }
});

// get or delete or update an order
app.route("/orders/:id").get(auth, (req, res, next) => {
    order.getModel().findOne({_id: req.params.id}, {}).then(
        (order) => {
            if (order)
                return res.status(200).json(order);
            else
                return res.status(404).json( {error:true, errormessage:"Invalid order ID"} );
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
}).delete(auth, (req, res, next) => {
    order.getModel().deleteOne({_id: req.params.id}).then(
        (query) => {
            if (query.deletedCount > 0)
                return res.status(200).json( {error:false, errormessage:""} );
            else
                return res.status(404).json( {error:true, errormessage:"Invalid order ID"} );
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    })
}).post(auth, (req, res, next) => {
    // TODO: what happen if in the dishes there aren't dishes in the db?
    order.getModel().updateOne({_id: req.params.id}, req.body).then(
        (updated) => {
            if (updated.acknowledged) {
                ios.emit('broadcast', order);
                return res.status(200).json(updated);
            } else {
                return res.status(404).json( {error:true, errormessage:"Invalid updating data"} );
            }
        }
    ).catch((reason) => {
        return next({ statusCode:404, error: true, errormessage: "DB error: "+reason });
    });
});

app.get("/table/:number/orders", auth, (req, res, next) => {
    table.getModel().findOne({number: req.params.number}).then(
        (table) => {
            if (!table)
                return next({ statusCode:404, error: true, errormessage: "Number is not a valid table"});
            order.getModel().find({table_number: req.params.number}).then(
                (orders) => {
                    return res.status(200).json(orders);
                }
            ).catch((reason) => {
                return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
            });
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    });
});

app.get("/user/:username/orders", auth, (req, res, next) => {
    user.getModel().findOne({username: req.params.username}).then(
        (user) => {
            if (!user)
                return next({ statusCode:404, error: true, errormessage: "Username is not a valid user"});
            order.getModel().find({creator_username: req.params.username}).then(
                (orders) => {
                    return res.status(200).json(orders);
                }
            ).catch((reason) => {
                return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
            });
        }
    ).catch((reason) => {
        return next({statusCode: 404, error: true, errormessage: "DB error: " + reason});
    })
})

// get general statistics about the restaurant
app.get("/statistics", auth, checkAdminRole, (req, res, next) => {

    // see the amount of money earned

    // how much sells per dish

    // when during the service there were more people
});

// get specific statistics for a user
app.get("/statistics/:username", auth, checkAdminRole, (req, res, next) => {

    // see how much orders did he/she take

    // how much money did he/she make

    // how many days did he/she work

    // how much did he/she cook/prepare drinks
});


// HTTP basic authentication strategy using passport middleware
passport.use(new passportHTTP.BasicStrategy(
    function(username, password, done) {
        user.getModel().findOne({username: username}, {}).then((user) => {
            if (!user)
                return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid user"});
            
            if (user.checkPassword(password))
                return done(null, user);

            return done(null, false, {statusCode: 500, error: true, errormessage: "Invalid password"});
        }).catch((err) => {
            return done({statusCode: 500, error: true, errormessage: err});
        });
    }
));

app.get("/login", passport.authenticate("basic", {session: false}), (req, res, next) => {
    let tokendata = {
        username: req.user.username,
        name: req.user.name,
        surname: req.user.surname,
        role: req.user.role
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
            // TODO: handle the password setting
            console.log("Adding users");
            let users = retrieveData(require('./util/users.json'), user);
            return Promise.all(users);
        }
    }
).then(
    () => {
        return order.getModel().countDocuments({});
    }
).then(
    (count) => {
        if (count === 0) {
            // insert boostrap tables
            console.log("Adding orders");
            let orders = retrieveData(require('./util/orders.json'), order);
            return Promise.all(orders);
        }
    }
).then(
    () => {
        let server = http.createServer(app);

        ios = io(server);
        ios.on('connection', (client) => {
        console.log("Socket.io client connected".green);
        });

        server.listen(8080, () => console.log("HTTP Server started on port 8080".green));
    }
).catch(
    (err) => {
        console.log("Error occurred during initialization".red);
        console.log(err);
    }
);