const express = require('express');
const path = require('path');
const WebSocketServer = require("ws").Server;
const logger = require('morgan');
const bodyParser = require('body-parser');
const history = require('connect-history-api-fallback');
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const helmet = require("helmet");

require("dotenv").config();

//Create Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(cors({
  origin: ["jeobeardy.com", "www.jeobeardy.com"],
  credentials: true,
}));

// app.use(helmet(
//   {
//     contentSecurityPolicy: {
//       // useDefaults: false,
//       directives: {
//         "default-src": ["'self'"],
//         "object-src": ["'none'"],
//         "script-src": ["'unsafe-inline'", "'unsafe-eval'", "'self'" ],
//         "base-uri": ["'none'"],
//         "frame-src": ["'none'"],
//         "media-src": ["'self'", "data:"],
//         "style-src-elem": ["'self'", "'unsafe-inline'"],
//         "connect-src": ["'self'", "ws:"],
// 	      "img-src": ["'self'", "blob:", "data:"],
//       }
//     }
//   }
// ));


const mongoDB = process.env.API_MONGO_CONN_URI;
const storeSecret = process.env.API_SESSION_STORE_SECRET;
const sessionSecureFlag = process.env.API_SESSION_COOKIE_SECURE === 'true';

// Initialize sesssion storage.
const store = new MongoDBStore({
  uri: mongoDB,
  collection: 'sessions',
});

store.on('error', function(error) {
  console.log("Store Error: ", error);
});

//Setup Mongoose
mongoose.set('strictQuery', false);

main().then(()=> console.log("Connected to MongoDB")).catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const sessionParser = session({
  store: store,
  secret: storeSecret,
  cookie: {
    secure: sessionSecureFlag,
    httpOnly: true,
    sameSite: true,
  },
  resave: false,
  saveUninitialized: false
})
app.use(sessionParser);
app.set("trust proxy", 1);


//Setup WebSocketServer
const webSocketHandler = require("./websocket/handler.js");
let wsServerList = [];

let wsServerOnConnectionCallback = ( socket, wsServer, sessionObjects  ) => {

  console.log(sessionObjects.sessionUserId);
  if( sessionObjects ) {
    socket.locals = {};
    socket.locals.user = sessionObjects.sessionUserId;
    socket.locals.game = sessionObjects.sessionGameId;
  }

  socket.on("error", ( data ) => {
    console.log("Got Error: ", data );
  });
  socket.on("message", ( data ) => {
    let gameSocketList = wsServerList.find( wsServerEntry => wsServerEntry.game === socket.locals.game );
    webSocketHandler.handleMessage( gameSocketList, socket, data )
    .catch( ( err ) => {
      console.error( err );
    });
  });
  socket.on("open", ( ) => {
    console.log("WS opened!");
  });
  socket.on("close", ( ) => {
    let gameSocketList = wsServerList.find( wsServerEntry => wsServerEntry.game === socket.locals.game );
    webSocketHandler.handleConnectionClose( gameSocketList, socket);
    console.log("WS closed!");
  });
  console.log("WS Connected!");
}

function onSocketError( error ){
  console.log( error );
}


//Import Routes
const userRoutes = require("./routes/UserRouter");
const gameRoutes = require("./routes/GameRouter");

//API Endpoints
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);


//Enable History for Vue Routes
app.use(history());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '/../../dist')));

//Listen to port
const port = 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

server.on("upgrade", ( req, socket, head ) => {
  sessionParser( req, {}, () => {
    if( req.session.game === undefined ){
      return;
    }

    let isNew = false;
    let sessionObjects = {
      sessionUserId: req.session.user,
      sessionGameId: req.session.game,
    }
    
    let wsServerEntryFound = wsServerList.find( wsServerEntry => wsServerEntry.game === req.session.game );
    let wsServer;
    if( wsServerEntryFound === undefined ){
      wsServer = new WebSocketServer( { noServer: true } );
      isNew = true;
      wsServer.on( "connection", wsServerOnConnectionCallback );
    } else {
      wsServer = wsServerEntryFound.wsServer;
    }

    wsServer.handleUpgrade(req, socket, head, function(ws){
        wsServer.emit('connection', ws, wsServer, sessionObjects);
    });

    if( isNew ){
      wsServerList.push( {
        game: req.session.game,
        wsServer: wsServer,
      } );
    }


  });

  socket.on("error", onSocketError);

});
