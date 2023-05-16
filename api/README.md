Nodejs + MongoDB + Express  backend
---

How to run it via Docker:

1. Create a new network

```
docker network create restaurant_app
```

2. Start a MongoDB container 

```
docker run --rm -d --network restaurant_app -v restaurant_api:/data/db --name mongodb mongo:6
```

3. Build the backend container from Dockerfile

```
docker build -t server .
```

4. Start the backend container

```
docker run --rm -it -p 8080:8080 --network restaurant_app -v C:\Users\edoar\Desktop\restaurant_app\api:/app server
```

4. Open the terminal and run

```
npm install
npm run compile
```

5. Run the application

```
node index.js
```


Optional:
---

To clean the compiled project

```
tsc --build --clean
```

To inspect the database with mongo shell:

```
docker run -it --name mongodbshell --network taw --rm mongo:6 mongosh --host mymongo
```

Then, inside the shell:

```
use postmessage;
show collections;
```
