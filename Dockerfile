FROM node:alpine

WORKDIR /usr/src/app/api

COPY package*.json ./

RUN npm i

COPY . .

CMD node server.js