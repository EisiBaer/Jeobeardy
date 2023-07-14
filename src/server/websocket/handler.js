const crypto = require("crypto");

const gameController = require("../controllers/GameControllerMongoose");
const playerController = require("../controllers/PlayerControllerMongoose");


exports.handleMessage = ( gameSocketList, socket, dataRaw ) => {
  return new Promise( (resolve, reject) => {

    if( dataRaw === undefined || !(dataRaw instanceof Object) ){
      console.log("Data not parseable")
      return false;
    }
    let data = JSON.parse( dataRaw );
    
    console.log(data)
    let payload = data.payload;
    console.log(payload)
    let sendObj = {};

    if( payload === undefined && !["host"].includes( data.event ) ){
      sendObj = { event: "payloadIncomplete", message: "The sent event doesn't have all required attributes in the payload!" };
      socket.send( JSON.stringify( sendObj ) );
      socket.close();
      reject( new Error("No payload sent"));
    }

    switch( data.event ){
      case "joinGame":
        if( payload.gameCode !== undefined && payload.playerName !== undefined ){
          playerController.addPlayer( payload.playerName )
          .then( ( player ) => {
            if( socket.locals === undefined ){
              socket.locals = {};
            }
            socket.locals.player = player._id.toString();
            return gameController.addPlayerToGame( payload.gameCode, player );
          })
          .then( ( game ) => {
            if( game === null ){
              throw new Error("Game not found");
            }
            //TODO: GameState? InLobby, InGame?????
            sendObj = { event: "joinSuccess", message: "Succesfully joined the game!", payload: { gameId: game._id, playerId: socket.locals.player, gameState: game.state }, };
            socket.send( JSON.stringify( sendObj ) );
            if( game.state === "IN_PROGRESS" ){
              sendObj = { event: "gameStarted", message: "Game is starting", payload: { gameId: game._id, board: game.board }, };
              socket.send( JSON.stringify( sendObj ) );
            }
            let message = `${payload.playerName} joined the Game`;
            let sendingData = { players: game.players }
            sendAllPlayers( socket, gameSocketList, "playersUpdated", message, sendingData )
            resolve();
          })
          .catch( err => {
            sendObj = { event: "joinFail", message: "Something went wrong while joining the game!" };
            socket.send( JSON.stringify( sendObj ) );
            reject( err );
          });
        } else {
          sendObj = { event: "payloadIncomplete", message: "The sent event doesn't have all required attributes in the payload!" };
          socket.send( JSON.stringify( sendObj ) );
          socket.close();
          resolve();
        }
        break;
      case "host":
        if( socket.locals === undefined || socket.locals.user === undefined || socket.locals.game === undefined ){
          sendObj = { event: "noUser", message: "No User detected. Make sure you are logged in to host a game!" };
          socket.send( JSON.stringify( sendObj ) );
          socket.close();
          resolve();
        } else {
          gameController.findGameByIdAndSetStateAndPopulateBoard( socket.locals.game, "IN_LOBBY" )
          .then( ( game ) => {
            console.log("Game successfully entered as host: ", game._id );
            socket.locals.game = game._id.toString();
            socket.locals.isHost = true;
            sendObj = { event: "gameCreated", payload: { gameId: game._id, players: game.players }, message: "Game successfully created!" };
            socket.send( JSON.stringify( sendObj ) );
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        }
        break;
      case "continueHost":
        if( socket.locals === undefined || socket.locals.user === undefined || socket.locals.game === undefined ){
          sendObj = { event: "noUser", message: "No User detected. Make sure you are logged in to host a game!" };
          socket.send( JSON.stringify( sendObj ) );
          socket.close();
          resolve();
        } else {
          gameController.findGameById( socket.locals.game )
          .then( ( game ) => {
            console.log("Game successfully entered as host: ", game._id );
            // socket.locals.game = game._id.toString();
            socket.locals.isHost = true;
            sendObj = { event: "hostRejoined", payload: { gameId: game._id, players: game.players }, message: "Host rejoined Game successfully!" };
            socket.send( JSON.stringify( sendObj ) );
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        }
        break;
      case "selectBoardForGame":
        if( socket.locals.isHost ){
          gameController.findGameById( socket.locals.game )
          .then( ( game ) => {
            game.board = payload.boardId;
            return game.save();
          })
          .then( ( savedGame ) => {
            let message = "The board which will be played has been changed";
            let sendingData = { boardId: savedGame.board };
            sendAllPlayers( socket, gameSocketList, "boardSelectedForGame", message, sendingData);
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "startGame":
        if( socket.locals.isHost ){
          gameController.findGameByIdAndSetStateAndPopulateBoard( socket.locals.game, "IN_PROGRESS" )
          .then( ( game ) => {
            if( game.players.length > 0 ){
              let randomPlayer = game.players[ crypto.randomInt(0, game.players.length ) ];
              game.playerChoosing = {
                playerId: randomPlayer._id.toString(),
                categoryIndex: null,
                boardEntryIndex: null,
              }
              return game.save();
            } else {
              return game;
            }
          })
          .then( ( game ) => {
            let choosingPlayer = undefined
            if( game.playerChoosing ){
              choosingPlayer = game.playerChoosing.playerId;
            }
            let message = "Game is starting";
            let sendingData = { gameId: game._id, board: game.board, choosingPlayer: choosingPlayer }; 
            sendAllPlayers( socket, gameSocketList, "gameStarted", message, sendingData);
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "selectBoardEntry":
        if( socket.locals.isHost ){
          let message = `BoardEntry ${payload.boardEntryIndex} selected`;
          let sendingData = { categoryIndex: payload.categoryIndex, boardEntryIndex: payload.boardEntryIndex };
          sendAllPlayers( socket, gameSocketList, "boardEntrySelected", message, sendingData );
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "letPlayerChoose":
        if( socket.locals.isHost ){
          gameController.findGameById( socket.locals.game )
          .then( ( game ) => {
            if( data.payload.playerId ){
              game.playerChoosing = {
                playerId: data.payload.playerId,
                categoryIndex: null,
                boardEntryIndex: null,
              }
              return game.save();
            } else {
              let currentChoosingPlayer = game.players.findIndex( playerEntry => playerEntry._id.toString() === game.playerChoosing.playerId );
              if( currentChoosingPlayer !== -1 ){
                let newChoosingPlayerIndex = currentChoosingPlayer + 1;
                if( newChoosingPlayerIndex === game.players.length ){
                  newChoosingPlayerIndex = 0;
                }
                game.playerChoosing = {
                  playerId: game.players[newChoosingPlayerIndex]._id.toString(),
                  categoryIndex: null,
                  boardEntryIndex: null,
                }
                return game.save();
              } else {
                return game;
              }
            }
          })
          .then( ( game ) => {
            let message = `Player ${game.playerChoosing.playerId} can choose a BoardEntry`;
            let sendingData = { choosingPlayer: game.playerChoosing.playerId };
            sendAllPlayers( socket, gameSocketList, "playerCanChoose", message, sendingData );
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        }
        break;
      case "playerChooseBoardEntry":
        gameController.findGameById( socket.locals.game )
        .then( ( game ) => {
          if( socket.locals.player === game.playerChoosing.playerId ){
            game.playerChoosing.categoryIndex = payload.categoryIndex;
            game.playerChoosing.boardEntryIndex = payload.boardEntryIndex;
            return game.save();
          } else {
            throw new Error("Message not sent by choosing Player");
          }
        })
        .then( ( game ) => {
          let chosenCategoryIndex = game.playerChoosing.categoryIndex;
          let chosenBoardEntryIndex = game.playerChoosing.boardEntryIndex;
          let choosingPlayer = game.playerChoosing.playerId;
          let message = `Category ${chosenCategoryIndex} with BoardEntry ${chosenBoardEntryIndex} selected`;
          let sendingData = { categoryIndex: chosenCategoryIndex, boardEntryIndex: chosenBoardEntryIndex, choosingPlayer: choosingPlayer };
          sendAllPlayers( socket, gameSocketList, "playerChoseBoardEntry", message, sendingData );
          resolve();
        })
        .catch( ( err ) => {
          reject( err );
        });  
        break;
      case "selectBoard":
        if( socket.locals.isHost ){
          let message = "Board selected";
          sendAllPlayers( socket, gameSocketList, "boardSelected", message, {});
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "showQuestion":
        if( socket.locals.isHost ){
          gameController.findGameAndSetAccepting( socket.locals.game, true )
          .then( ( game ) => {
            return playerController.setAllPlayersAcceptAnswers( game.players.map( playerEntry => playerEntry._id ), true )
          })
          .then( () => {
            let message = "Question revealed";
            sendAllPlayers( socket, gameSocketList, "questionRevealed", message, {});
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "playAudioForQuestion":
        if( socket.locals.isHost ){
          let message = "Audio started playing";
          sendAllPlayers( socket, gameSocketList, "audioPlaying", message, {});
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "stopAudioForQuestion":
        if( socket.locals.isHost ){
          let message = "Audio stopped playing";
          sendAllPlayers( socket, gameSocketList, "audioStopped", message, {});
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "hideQuestion":
        if( socket.locals.isHost ){
          gameController.findGameAndSetAccepting( socket.locals.game, false )
          .then( ( _game ) => {
            let message = "Question hidden";
          sendAllPlayers( socket, gameSocketList, "questionHidden", message, {});
          resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "selectQuestionLayer":
        if( socket.locals.isHost ){
          let message = `Question Layer ${payload.questionIndex} selected`;
          let sendingData = { questionIndex: payload.questionIndex };
          sendAllPlayers( socket, gameSocketList, "questionLayerSelected", message, sendingData );
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "showAnswer":
        if( socket.locals.isHost ){
          gameController.findGameAndSetAccepting( socket.locals.game, false )
          .then( ( _game ) => {
            let message = "Answer revealed";
            sendAllPlayers( socket, gameSocketList, "answerRevealed", message, {});
            resolve();
          })
          .catch( ( err ) =>  {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "hideAnswer":
        if( socket.locals.isHost ){
          let message = "Answer hidden";
          sendAllPlayers( socket, gameSocketList, "answerHidden", message, {});
          resolve();
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "addPointsToPlayer":
        if( socket.locals.isHost ){
          gameController.findGameAndSetAccepting( socket.locals.game, payload.reopenQuestion )
          .then( ( game ) => {
            let playerIndex = game.players.findIndex( playerEntry => playerEntry._id.toString() === payload.playerId );
            if( playerIndex === -1 ){
              throw new Error("Player not found");
            }
            let adjustedPoints = Number(game.players[playerIndex].points) + Number(payload.pointsAdjustment);
            return gameController.setPlayerPointsAndReturnGame( game._id, payload.playerId, adjustedPoints );
          })
          .then( ( game ) => {
            let playerIndex = game.players.findIndex( playerEntry => playerEntry._id.toString() === payload.playerId );
            if( playerIndex === -1 ){
              throw new Error("Player not found");
            } else {
              let message = `Player ${payload.playerName} got ${payload.pointsAdjustment} points`;
              let sendingData = { adjustedPlayer: game.players[playerIndex], acceptAnswers: game.acceptAnswers }
              sendAllPlayers( socket, gameSocketList, "pointsAdjusted", message, sendingData );
              resolve();
            };
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "questionAnswered":
        if( socket.locals.isHost ){
          gameController.findGameAndAddAnsweredEntry( socket.locals.game, payload.categoryIndex, payload.boardEntryIndex )
          .then( ( _game ) => {
            let message = `A question has been marked as answered`;
            let sendingData = { categoryIndex: payload.categoryIndex, boardEntryIndex: payload.boardEntryIndex }
            sendAllPlayers( socket, gameSocketList, "questionAnswered", message, sendingData );
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "questionAnsweredRevert":
        if( socket.locals.isHost ){
          gameController.findGameAndRemoveAnsweredEntry( socket.locals.game, payload.categoryIndex, payload.boardEntryIndex )
          .then( ( _game ) => {
            let message = `A answered question has been reverted to not answered`;
            let sendingData = { categoryIndex: payload.categoryIndex, boardEntryIndex: payload.boardEntryIndex }
            sendAllPlayers( socket, gameSocketList, "questionNotAnswered", message, sendingData );
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("Message not sent by host") );
        }
        break;
      case "pressBuzzer":
          if( socket.locals.player !== undefined ){
            //maybe add game option if player can buzzer multiple times?
            playerController.checkPlayerAcceptAnswersAndSetAccepting( socket.locals.player, false )
            .then( ( isAcceptingAnswers ) => {
              if( isAcceptingAnswers ){
                return gameController.findAcceptingGameAndSetNotAccepting( socket.locals.game )
              } else {
                return false;
              }
            })
            .then( ( foundGame ) => {
              if( foundGame ){
                sendAllPlayers( socket, gameSocketList, "playerBuzzered", "A player pressed the buzzer", { playerId: socket.locals.player });
              }
              resolve();
            })
            .catch( ( err ) => {
              reject( err );
            });
          } else {
            reject( new Error("No playerId found for connection") );
          }
        break;
      case "updateAnswerText":
        if( socket.locals.player !== undefined ){
          gameController.findGameAcceptingAnswers( socket.locals.game )
          .then( ( _game ) => {
            sendToHost( socket, gameSocketList, "playerAnswerTextUpdated", "A player updated their answer text", { playerId: socket.locals.player, updatedText: payload.updatedText });
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          })
        } else {
          reject( new Error("No playerId found for connection") );
        }
        break;
      case "lockQuestion":
        if( socket.locals.isHost ){
          gameController.findGameAndSetAccepting( socket.locals.game, false )
          .then( ( _game ) => {
            sendAllPlayers( socket, gameSocketList, "questionLocked", "Question was locked. Answers can no longer be changed", {});
            resolve();
          })
          .catch( ( err ) => {
            reject( err );
          });
        } else {
          reject( new Error("No playerId found for connection") );
        }
        break;
      case "revealPlayerAnswers":
        if( socket.locals.isHost ){
          sendAllPlayers( socket, gameSocketList, "playerAnswersRevealed", "Answers of one or more players revealed", { revealedAnswers: payload });
          resolve();
        } else {
          reject( new Error("No playerId found for connection") );
        }
        break;
    }
  });
}

exports.handleConnectionClose = ( gameSocketList, socket) => {
  if( gameSocketList.wsServer.clients.size === 0 ){
    gameController.deleteGame( socket.locals.game )
    .catch( ( err ) => {
      console.error( "An error occured while deleting an unused game!" );
      console.error( err );
    })
  }
  if( socket.locals.isHost ){
    //TODO implement for host
  } else {
    gameController.removePlayerFromGame( socket.locals.game, socket.locals.player )
    .then( ( _updatedGame ) => {
      return playerController.deletePlayer( socket.locals.player )
    })
    .then( ( player ) => {
      if( player ){
        sendAllPlayers( socket, gameSocketList, "playerLeft", "A player left the game", { player: player }, );
      }else {
        throw new Error(`Player not found for deletion: ${socket.locals.player}`);
      }
    })
    .catch( ( err ) => {
      console.error( err );
    });
  }
}

function sendAllPlayers( socket, gameSocketList, eventName, message, payload ){
  if( gameSocketList === undefined ){
    throw new Error("Game not Found in SocketList");
  }
  gameSocketList.wsServer.clients.forEach( playerSocket => {
    let sendObj = {
      event: eventName,
      message: message,
      payload: payload
    };
    playerSocket.send( JSON.stringify( sendObj ) );
  });
}

function sendToHost( socket, gameSocketList, eventName, message, payload ){
  if( gameSocketList === undefined ){
    throw new Error("Game not Found in SocketList");
  }
  gameSocketList.wsServer.clients.forEach( playerSocket => {
    if( playerSocket.locals.isHost ){
      let sendObj = {
        event: eventName,
        message: message,
        payload: payload
      };
      playerSocket.send( JSON.stringify( sendObj ) );
      return;
    }
  });
}