# Dockerfile
FROM node:22-alpine

# Install dependencies for wait script
RUN apk add --no-cache bash

WORKDIR /usr/src/app

# Add wait script
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.12.1/wait /wait
RUN chmod +x /wait

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p logs

EXPOSE 3000

# Wait for services then start
CMD /wait && node src/server.js
