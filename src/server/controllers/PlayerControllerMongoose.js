const GameModel = require("../models/GameModel");
const PlayerModel = require("../models/PlayerModel");

/**
 * Creates a new Player and resolves with it
 * @param {String} hostName
 * @returns A promise which resolves when a new player has been created. Rejects if an error occurs
 */
exports.addPlayer = (playerName) => {
  return new Promise((resolve, reject) => {
    let newPlayer = new PlayerModel({
      name: playerName,
      points: 0,
    });

    newPlayer.save()
    .then( ( user ) => {
        resolve( user );
    })
    .catch( ( err ) => {
        reject( err );
    });
  });
}

/**
 * Deletes a player
 * @param {String} hostName
 * @returns A promise which resolves when the player has been deleted
 */
exports.deletePlayer = ( playerId ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.findByIdAndRemove( playerId )
    .then( ( deletedUser ) => {
        resolve( deletedUser );
    })
    .catch( ( err ) => {
        reject( err );
    });
  });
}

/**
 * Checks if a player is allowed to currently answer a question
 * @param {String} playerId
 * @returns A promise which resolves with wheter the player is allowed to answer or not. Rejects if an error occurs or host is not found.
 */
exports.setAllPlayersAcceptAnswers = ( playerIds, acceptAnswersValue ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.updateMany( { _id: { $in : playerIds } }, { acceptAnswers: acceptAnswersValue } )
    .then( ( players ) => {
      if( players ){
        resolve();
      } else {
        let playerNotFoundError = new Error(`No players found with any id of "${playerIds}"`);
        playerNotFoundError.name = "NotFoundError";
        reject(playerNotFoundError);
      }
    })
    .catch( ( err ) => {
      reject( err );
    })
  });
}

/**
 * Sets one player as isChoosing and other players as isChoosing false
 * @param {String} choosingPlayerId
 * @param {Array} notChoosingPlayerIds
 * @returns A promise which resolves with the choosing player
 */
exports.setAllPlayersAcceptAnswers = ( choosingPlayerId, notChoosingPlayerIds ) => {
  return new Promise((resolve, reject) => {
    let promiseSetChoosing = PlayerModel.updateOne( { _id: choosingPlayerId }, { isChoosing: true } );
    let promiseSetNotChoosing = PlayerModel.updateMany( { _id: { $in : notChoosingPlayerIds } }, { isChoosing: false } );
    Promise.all( [ promiseSetChoosing, promiseSetNotChoosing ] )
    .then( ( resArr ) => {
      resolve( resArr[0] );
    })
    .catch( ( err ) => {
      reject( err );
    })
  });
}

/**
 * Checks if a player is allowed to currently answer a question
 * @param {String} playerId
 * @returns A promise which resolves with wheter the player is allowed to answer or not. Rejects if an error occurs or host is not found.
 */
exports.checkPlayerAcceptAnswers = ( playerId ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.findById( playerId )
    .then( ( player ) => {
      if( player ){
        resolve( player.acceptAnswers );
      } else {
        let playerNotFoundError = new Error(`No player found with id "${playerId}"`);
        playerNotFoundError.name = "NotFoundError";
        reject(playerNotFoundError);
      }
    })
    .catch( ( err ) => {
      reject( err );
    })
  });
}

/**
 * Checks if a player is allowed to choose a BoardEntry
 * @param {String} playerId
 * @returns A promise which resolves with wheter the player is allowed to choose a BoardEntry or not. Rejects if an error occurs.
 */
exports.checkPlayerCanChoose = ( playerId ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.findById( playerId )
    .then( ( player ) => {
      if( player ){
        resolve( player.isChoosing );
      } else {
        let playerNotFoundError = new Error(`No player found with id "${playerId}"`);
        playerNotFoundError.name = "NotFoundError";
        reject(playerNotFoundError);
      }
    })
    .catch( ( err ) => {
      reject( err );
    })
  });
}

/**
 * Checks if a player is allowed to currently answer a question and sets it to the specified value
 * @param {String} playerId
 * @returns A promise which resolves with wheter the player is allowed to answer or not. Rejects if an error occurs or host is not found.
 */
exports.checkPlayerAcceptAnswersAndSetAccepting = ( playerId, canAcceptAfter ) => {
  return new Promise((resolve, reject) => {
    PlayerModel.findByIdAndUpdate( playerId, { acceptAnswers: canAcceptAfter }, { new: false } )
    .then( ( player ) => {
      if( player ){
        resolve( player.acceptAnswers );
      } else {
        let playerNotFoundError = new Error(`No player found with id "${playerId}"`);
        playerNotFoundError.name = "NotFoundError";
        reject(playerNotFoundError);
      }
    })
    .catch( ( err ) => {
      reject( err );
    })
  });
}
