const express = require("express");
const router = express.Router();

const gameController = require("../controllers/GameControllerMongoose");

router.get("/list", (req, res) => {
  res.send(gameController.listGames());
});

// Add Game route.
router.post("/host", (req, res) => {
  if (req.session.user !== undefined) {
    gameController.findGameByHostId( req.session.user )
    .then( ( game ) => {
      if( game ){
        return game;
      } else {
        return gameController.addGame(req.session.user)
      }
    })
    // gameController
      // .addGame(req.session.user)
      .then( ( game ) => {
        return setSessionGame( req, game );
      })
      .then((game) => {
        res.send({ success: true, code: game.code });
      })
      .catch((err) => {
        res.send({ success: false, error: err });
      });
  } else {
    res.send({ success: false, error: "To host a game you need to be logged in!" });
  }
});

router.get("/join/setup/:code", (req, res) => {
  console.log("Getting game with code: ", req.params.code);
  gameController.findGameWithCode(req.params.code)
    .then( ( game ) => {
      return setSessionGame( req, game );
    })
		.then( ( game ) => {
			res.send({ success: true, });
		})
    .catch((err) => {
      res.status(200).send({ success: false, error: { name: err.name, message: err.message } });
    });
});

router.get("/check/:gameId", (req, res) => {
  console.log("Getting game with id: ", req.params.gameId);
  let isHost = false;
  gameController.findGameById( req.params.gameId )
    .then( ( game ) => {
      if( req.session.user !== undefined && game.host === req.session.user ){
        isHost = true;
      }
      return setSessionGame( req, game );
    })
		.then( ( game ) => {
			res.send({ success: true, gameCode: game.code, isHost: isHost, gameState: game.state });
		})
    .catch((err) => {
      res.status(200).send({ success: false, error: { name: err.name, message: err.message } });
    });
});

router.get("/:gameId/board", (req, res) => {
  console.log("Getting board for game with id: ", req.params.gameId);
  gameController.findBoardForGameId( req.params.gameId )
    .then( ( board ) => {
			res.send({ success: true, board: board, });
		})
    .catch((err) => {
      res.status(200).send({ success: false, error: { name: err.name, message: err.message } });
    });
});

router.get("/file/:filename", (req, res) => {
  console.log("Getting file: ", req.params.filename);
  let options = {
    root: 'public/uploads',
    dotfiles: 'deny',
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
  res.sendFile( req.params.filename, options );
});

module.exports = router;

function setSessionGame( req, game) {
  return new Promise((resolve, reject) => {
    req.session.game = game._id.toString();
    req.session.save((errSave) => {
      if (errSave) {
        reject();
      } else {
        resolve( game );
      }
    });
  });
}
