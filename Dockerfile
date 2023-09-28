FROM node:16.13.0
ENV NODE_ENV=development

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm install nodemon

EXPOSE 4000

CMD ["npm","start"]