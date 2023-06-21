# Restaurant App

Made with the MEAN stack (MongoDB + ExpressJS + Angular + NodeJS)
---

### How to run it via Docker:

From the restaurant_app folder:

1. Create a new network

```
docker network create restaurant_app
```

2. Start a MongoDB container 

```
docker run --network restaurant_app --name mymongo -d mongo:6
```

3. Build the backend image

```
docker build -t backend-image ./api/
```

4. Run the backend container

```
docker run -d --name backend-container --network=restaurant_app -p 8080:8080 backend-image
```

5. Build the frontend image

```
docker build -t frontend-image ./frontend/
```

6. Run the frontend container

```
docker run -d --name frontend-container --network=restaurant_app -p 4200:4200 frontend-image
```

7. Insert in the browser navigation bar

```
http://localhost:4200/
```

### To test:

Usernames:
- cashier: admin, user1
- cook: user2, user3
- bartender: user4, user5
- waiter: user6, user7, user8, user9

Users' passwords are the same as their username (e.g. user1:user1)

### Optional:
---

To inspect the database with mongo shell:

```
docker run -it --name mongodbshell --network restaurant_app --rm mongo:6 mongosh --host mymongo
```

Then, inside the shell:

```
use index;
show collections;
db.<collection>.find();
```