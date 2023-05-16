FROM node:19-slim
LABEL maintainer="Edoardo Cecchinato <880759@stud.unive.it>"

EXPOSE 8080

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run compile

CMD node index

