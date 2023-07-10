# Jeobeardy

Jeobeardy (/dʒebeərdi/) is similiar to but not quite like Jeopardy. It is a quiz game where you can create your own boards with categories and then make your friends compete in a fun and interactive way

## Code Structure

- Server-side code can be found inside the ./src/server directory
- Client-side code can be found inside the ./src/webapp directory

To install the necessary dependencies for the project, clone the repository and run

```sh
npm install
```
## Run Server-side code

```sh
node ./src/server/server.js
```
or
```sh
npm start
```
to also build the client side code to be served by express (without Hot-Reload).

## Run Client-side code

### Compile with Hot-Reload for Development

```sh
npm run dev
```