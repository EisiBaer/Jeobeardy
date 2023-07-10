const mongoose = require("mongoose");

const util = require("../util");
const GameModel = require("../models/GameModel");
const PlayerModel = require("../models/PlayerModel");
const UserModel = require("../models/UserModel");

exports.listGames = () => {
  return new Promise((resolve, reject) => {
    GameModel.find({})
      .then((games) => {
        resolve(games);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its code and resolves with it
 * @param {String} code 
 * @returns A promise
 */
exports.findGameWithCode = (code) => {
  return new Promise((resolve, reject) => {
    GameModel.findOne({ code: code })
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with code "${code}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve(game);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its code and resolves with it
 * @param {String} code 
 * @returns A promise
 */
exports.findGameByHostId = ( hostId ) => {
  return new Promise((resolve, reject) => {
    GameModel.findOne({ host: hostId })
      .then((game) => {
        resolve(game);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its id and resolves with it
 * @param {String} id _id
 * @returns A promise
 */
exports.findGameById = (id) => {
  return new Promise((resolve, reject) => {
    GameModel.findById( id ).populate("players")
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with code "${id}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve(game);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its id and resolves with it with board populated
 * @param {String} id _id
 * @returns A promise
 */
exports.findGameByIdAndPopulateBoard = (id) => {
  return new Promise((resolve, reject) => {
    GameModel.findById( id ).populate("board")
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with id "${id}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve(game);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its id and sets its state and then resolves with it with board populated
 * @param {String} id _id
 * @returns A promise
 */
exports.findGameByIdAndSetStateAndPopulateBoard = ( id, state ) => {
  return new Promise((resolve, reject) => {
    GameModel.findByIdAndUpdate( id, { $set: { state: state } } ).populate("board")
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with id "${id}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve(game);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its id and resolves with its board
 * @param {String} id _id
 * @returns A promise
 */
exports.findBoardForGameId = ( id, state ) => {
  return new Promise((resolve, reject) => {
    GameModel.findById( id ).populate("board")
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with id "${id}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve(game.board);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Finds a game by its id and resolves with it with board populated
 * @param {String} id _id
 * @param {Number} categoryIndex Index of Category of Board Entry to be marked as answered
 * @param {Number} boardEntryIndex Index of BoardEntry in category to be marked as answered
 * @returns A promise
 */
exports.findGameAndAddAnsweredEntry = ( id, categoryIndex, boardEntryIndex ) => {
  return new Promise((resolve, reject) => {
    let dbEntry = {
      categoryIndex: categoryIndex,
      boardEntryIndex: boardEntryIndex,
    }
    GameModel.findByIdAndUpdate(id, { $addToSet: { "answeredBoardEntries": dbEntry } }, { new: true } ).populate("board")
    .then( ( game ) => {
      if( game === null ){
        let gameNotFoundError = new Error(`No game found with id "${id}"`);
        gameNotFoundError.name = "NotFoundError";
        reject(gameNotFoundError);
      } else {
        resolve(game);
      }
    })
    .catch( ( err ) => {
      reject(err);
    });
  });
};

/**
 * Finds a game by its id and resolves with it with board populated
 * @param {String} id _id
 * @param {Number} categoryIndex Index of Category of Board Entry to be marked as NOT answered
 * @param {Number} boardEntryIndex Index of BoardEntry in category to be marked as NOT answered
 * @returns A promise
 */
exports.findGameAndRemoveAnsweredEntry = ( id, categoryIndex, boardEntryIndex ) => {
  return new Promise((resolve, reject) => {
    GameModel.findByIdAndUpdate(id, { $pull: { answeredBoardEntries: { categoryIndex: categoryIndex, boardEntryIndex: boardEntryIndex } } }, { new: true } ).populate("board")
    .then( ( game ) => {
      if( game === null ){
        let gameNotFoundError = new Error(`No game found with id "${id}"`);
        gameNotFoundError.name = "NotFoundError";
        reject(gameNotFoundError);
      } else {
        resolve(game);
      }
    })
    .catch( ( err ) => {
      reject(err);
    });
  });
};

exports.findAcceptingGameAndSetNotAccepting = ( id ) => {
  return new Promise((resolve, reject) => {
    GameModel.findOneAndUpdate({ _id : id, acceptAnswers: true }, { acceptAnswers: false }, { new: true })
      .then((game) => {
        if( game === null){
          resolve( false );
        } else {
          resolve( true );
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.findGameAndSetAccepting = ( id, isAccepting ) => {
  return new Promise((resolve, reject) => {
    GameModel.findByIdAndUpdate( id, { acceptAnswers: isAccepting }, { new: true }).populate("players")
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with code "${id}"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve( game );
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.findGameAcceptingAnswers = ( id ) => {
  return new Promise((resolve, reject) => {
    GameModel.findOne({ _id : id, acceptAnswers: true } )
      .then((game) => {
        if( game === null){
          let gameNotFoundError = new Error(`No game found with code "${id}" and acceptAnswers "true"`);
          gameNotFoundError.name = "NotFoundError";
          reject(gameNotFoundError);
        } else {
          resolve( game );
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.setPlayerPointsAndReturnGame = ( gameId, playerId, pointsAdjusted ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.findByIdAndUpdate(
      mongoose.Types.ObjectId( playerId ),
      { 
        $set: {
          points: pointsAdjusted,
        }
      },
      { new: true }
    )
    .then( ( player ) => {
      if( player === null ){
        let playerNotFoundError = new Error(`No player found with id "${playerId}"`);
        playerNotFoundError.name = "NotFoundError";
        throw playerNotFoundError;
      }
      return this.findGameById( gameId );
    })
    .then( ( game ) => {
      if( game === null){
        let gameNotFoundError = new Error(`No game found with id "${gameId}"`);
        gameNotFoundError.name = "NotFoundError";
        reject(gameNotFoundError);
      } else {
        resolve( game );
      }
    })
    .catch((err) => {
      reject(err);
    });
  });
};

/**
 * Creates a new Game and adds the user with username of "hostName" as the host
 * @param {String} hostName 
 * @returns A promise which resolves when a new game has been created. Rejects if an error occurs or host is not found.
 */
exports.addGame = (hostId) => {
  return new Promise((resolve, reject) => {
    UserModel.findById( hostId, '-password' )
    .then( (host) => {
      if( host === null ){
        return null;
      }
      let newGame = new GameModel({
        code: util.makeid(8),
        host: host,
        state: "CREATED",
      });
      return newGame.save();
    })
    .then( ( game ) => {
      if( game === null ){
        reject( "No User found" );
      } else {
        resolve( game );
      }
    })
    .catch( (err) => {
      reject( err );
    });
  });
};

/**
 * Deletes a Game
 * @param {String} hostName 
 * @returns A promise which resolves when a new game has been created. Rejects if an error occurs or host is not found.
 */
exports.deleteGame = ( gameId ) => {
  return new Promise((resolve, reject) => {
    GameModel.findByIdAndRemove( gameId )
    .then( ( game ) => {
      if( game === null ){
        throw new Error( "No Game found for deletion" );
      } else {
        return PlayerModel.deleteMany( { _id: { $in: game.players } } )
      }
    })
    .then( ( _deletedCount ) => {
      resolve();
    })
    .catch( (err) => {
      reject( err );
    });
  });
};

exports.addPlayerToGame = ( gameCode, player ) => {
  return new Promise( (resolve, reject) => {
    GameModel.findOne(
      { code: gameCode },
    )
    .then( game => {
      if( game === null ){
        throw new Error( "Game not found" );
      } else {
        game.players.push( player._id );
        return game.save();
      }
    })
    .then( ( gameSaved ) => {
      return gameSaved.populate( "players" );
    })
    .then( ( gamePopulated ) => {
      resolve( gamePopulated );
    })
    .catch( err => {
      reject( err );
    });
  })
}

exports.removePlayerFromGame = ( gameId, playerId ) => {
  return new Promise( (resolve, reject) => {
    GameModel.findByIdAndUpdate( gameId, { $pull: { players: { playerId } } } )
    .then( _game => {
      resolve();  
    })
    .catch( err => {
      reject( err );
    });
  })
}