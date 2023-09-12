FROM node:16-alpine

RUN mkdir /app && chown node:node /app
WORKDIR /app

COPY --chown=node:node package.json package-lock.json* ./
RUN npm install

USER node
COPY --chown=node:node . .

RUN npm run build

CMD ["npx", "serve", "build", "-l", "3001"]