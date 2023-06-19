FROM node:19-slim
LABEL maintainer="Edoardo Cecchinato <880759@stud.unive.it>"

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .

EXPOSE 4200

CMD ng serve --host 0.0.0.0