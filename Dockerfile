FROM node:alpine

WORKDIR /usr/src/app/api

COPY package*.json ./

RUN npm i

COPY . .

ENV PORT=5000

CMD node server.js