# syntax=docker/dockerfile:1

FROM node:19.9.0-alpine
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "start"]
EXPOSE 3000
