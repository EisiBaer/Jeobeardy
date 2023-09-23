import { defineStore } from "pinia";
import GameService from "@/services/GameService";
import { useUserStore } from "@/stores/UserStore";
import { GAME_STATES } from "@/services/GameService";
import Board from "@/models/Board";
import { boardResponseToBoardModel } from "@/services/util";

const gService = new GameService();

export const useGameStore = defineStore('game', {
  state: ()=>{
    return {
      gameState: GAME_STATES.NONE,
      gameCode: "",
      playerName: "",
      playerId: -1,
      isHost: false,
      websocketConnection: {},
      players: [],
      socketListeners: [],
      gameService: gService,
      //concrete Game Data
      currentQuestion: {},
      board: new Board( undefined, "New Board", []),
      acceptAnswers: false,
      isPlayerChoosing: false,
      chosenEntry: undefined,
      keepAliveInterval: undefined,
    }
  },
  actions: {
    setPlayerPoints( adjustedPlayer ){
      let playerToAdjustIndex = this.players.findIndex( playersEntry => playersEntry._id === adjustedPlayer._id );
      if( playerToAdjustIndex !== -1 ){
        this.players[playerToAdjustIndex].points = adjustedPlayer.points;
        this.players[playerToAdjustIndex].isAnswering = false;
      }
    },
    setPlayerOnIndexChoosing( playerId ){
      let playerIndex = this.players.findIndex( playerEntry => playerEntry._id === playerId );
      for( let i in this.players ){
        this.players[i].isChoosing = Number( i ) === Number( playerIndex );
      }
      this.isPlayerChoosing = playerId === this.playerId;
    },
    setBoardWithConversion( board ){
      this.board = boardResponseToBoardModel( board );
    },
    setAnswersForPlayers( revealingAnswers ){
      for( let reveal of revealingAnswers ){
        let playerIndex = this.players.findIndex( playerEntry => playerEntry._id === reveal.playerId );
        if( playerIndex !== -1 ){
          this.players[playerIndex].answer = reveal.answer;
        }
      }
    },
    checkExistingGame( gameId ){
      return new Promise( ( resolve, reject ) => {
        this.gameService.checkExistingGame( gameId )
        .then( ( res ) => {
          if( res.data.success ){
            let data = {
              isHost: res.data.isHost,
              gameState: res.data.gameState,
            }
            this.gameCode = res.data.gameCode;
            resolve( data );
          } else {
            throw new Error("Request not successfull");
          }
        })
        .catch( ( err ) => {
          console.err(err);
          reject("An Error occured while joining this game! You will be forwarded to the main page");
        })
      });
    },
    setupNewHostGame(){
      return new Promise( ( resolve, reject ) =>{
        this.gameService.setupNewHostGame()
        .then( res =>{
          if( res.data.success ){
            this.gameState = GAME_STATES.INIT;
            this.gameCode = res.data.code;
            this.isHost = true;
            resolve();
          } else {
            reject( res.data.error );
          }
        })
        .catch( ( _err ) =>{
          reject( { error: "catch", message: "Something went wrong while starting the lobby" } );
        });
      });
    },
    hostNewGame(){
      return new Promise( ( resolve, reject ) => {
        this.addSocketListener("noUser", ( data ) => {
          this.removeSocketListener("noUser");
          this.removeSocketListener("gameCreated");
          this.gameState = GAME_STATES.NONE;
          reject( data.message );
        });
        this.addSocketListener("gameCreated", ( data ) => {
          this.removeSocketListener("gameCreated");
          this.removeSocketListener("noUser");
          this.players = data.payload.players;
          this.gameState = GAME_STATES.NONE;
          resolve( data.payload.gameId );
        });
        
        let sendObj = { event: "host", message: "Host a new Game" };
        this.websocketConnection.send( JSON.stringify( sendObj ) );
      })
    },
    prepareGameWithCode( enteredGameCode ){
      return new Promise( ( resolve, reject ) =>{
        let isGameCodeValid = this.validateGameCode( enteredGameCode );
        if( isGameCodeValid === true ){
          this.gameCode = enteredGameCode;
          this.gameService.setupJoinGame( this.gameCode )
          .then( res =>{
            if( res.data.success ){
              this.gameState = GAME_STATES.INIT;
              resolve();
            } else {
              reject( res.data.error );
            }
          })
          .catch( ( _err ) =>{
            reject( "Something went wrong while joining" );
          });
        } else {
          reject( isGameCodeValid );
        }
      });
    },
    joinGame( playerName ){
      return new Promise( ( resolve, reject ) =>{
        if( this.websocketConnection.readyState === 1 ){
          
          this.addSocketListener("joinSuccess", ( data ) => {
            this.removeSocketListener("joinSuccess");
            this.removeSocketListener("joinFail");
            this.gameState = GAME_STATES.INIT;
            this.playerId = data.payload.playerId;
            resolve( data.payload.gameId );
          });
          this.addSocketListener("joinFail", ( data ) => {
            this.removeSocketListener("joinSuccess");
            this.removeSocketListener("joinFail");
            this.gameState = GAME_STATES.NONE;
            reject( data );
          });

          this.playerName = playerName;
          let sendObj = {
            event: "joinGame",
            message: "Joining Game",
            payload: {
              gameCode: this.gameCode,
              playerName: this.playerName,
            }
          }
          this.websocketConnection.send( JSON.stringify( sendObj ) );
        } else {
          reject( "Comunication failed. Make sure you joined via the \"Join Game\" functionality" );
        }
      });
    },
    continueHosting(){
      return new Promise( ( resolve, reject ) => {
        this.addSocketListener("noUser", ( data ) => {
          this.removeSocketListener("noUser");
          this.removeSocketListener("hostRejoined");
          this.gameState = GAME_STATES.NONE;
          reject( data.message );
        });
        this.addSocketListener("hostRejoined", ( data ) => {
          this.removeSocketListener("hostRejoined");
          this.removeSocketListener("noUser");
          this.players = data.payload.players;
          this.isHost = true;
          resolve( data.payload.gameId );
        });
        
        let sendObj = { event: "continueHost", message: "Host a new Game" };
        this.websocketConnection.send( JSON.stringify( sendObj ) );
      })
    },
    getBoardToGame( gameId ){
      return new Promise( ( resolve, reject ) => {

        this.gameService.getBoardToGame( gameId )
        .then( ( res ) => {
          if( res.data.success ){
            this.setBoardWithConversion( res.data.board );
            resolve();
          } else {
            reject( res.data );
          }
        })
        .catch( ( err ) => {
          reject( err );
        })
      })
    },
    setupWebsocket(){
      return new Promise( ( resolve, reject) => {
        
        this.setDefaultSocketListeners();

        let protocol = ('https:' == document.location.protocol ? 'wss' : 'ws');
        let hostname = window.location.hostname;
        if( window.location.hostname.includes("localhost" ) ){
            hostname += ':3000';
        }
        
        this.websocketConnection = new WebSocket(`${protocol}://${hostname}/ws`);

        let timeout = setTimeout( () => {
          reject();
        }, 5000);

        this.websocketConnection.onopen = ( _event ) => {
          this.keepAliveInterval = setInterval( () => {
            this.sendEvent("keepAlive", {} );
          }, 55000);
	  clearTimeout(timeout);
          resolve();
        }

        this.websocketConnection.onmessage = ( message ) => {
          let dataRaw = message.data;
          if( dataRaw === undefined || typeof dataRaw !== "string" ){
            console.error("Data not parseable")
            return;
          }
          let data = JSON.parse( dataRaw );
          
          this.socketListeners.forEach( x => {
            if( data.event === x.event){
              x.callback(data);
            }
          });
        };
        this.websocketConnection.onerror = ( _event ) => {
          console.error("Websocket Error");
        };
        this.websocketConnection.onclose = ( _event ) => {
          clearInterval( this.keepAliveInterval );
          this.keepAliveInterval = undefined;
	        const userStore = useUserStore();
          userStore.resetInitialUserDataPromise();
          userStore.initialUserPromise
          .then( ( userData ) => {
            userStore.setUser( userData );
          })
          .catch( ( err ) => {
            console.error( err );
          });

          this.resetGameState();

          this.router.push( { name: "home" } );
        }
      });
    },
    resetGameState(){
      this.gameState = GAME_STATES.NONE;
      this.gameCode = "";
      this.playerName = "";
      this.playerId = -1;
      this.isHost = false;
      this.players = [];
      this.board = new Board( undefined, "New Board", []);
      this.acceptAnswers =  false;
      this.isPlayerChoosing = false;
      this.chosenEntry = undefined;
    },
    closeWebSocket(){
      this.websocketConnection.close();
    },
    validateGameCode( gameCode ){
      if( gameCode.length !== 8 ){
        return "Code is 8 characters long";
      }
      return true;
    },
    addSocketListener( eventName, callback ){
      if( this.socketListeners.find( x => x.event === eventName) ){
        return false;
      }
      this.socketListeners.push({
        event: eventName,
        callback: callback,
      });
      return true;
    },
    removeSocketListener( eventName ){
      let deleteIndex = this.socketListeners.findIndex( x => x.event === eventName);
      if( deleteIndex !== -1 ){
        this.socketListeners.splice( deleteIndex, 1 );
        return true;
      } else {
        return false;
      }
    },
    sendEvent( eventName, payload ){
      if( this.websocketConnection ){
        this.websocketConnection.send( JSON.stringify( { event: eventName, payload: payload } ) );
      }
    },
    setDefaultSocketListeners(){
      this.addSocketListener("playersUpdated", ( data ) => {
        if( data.payload !== undefined ){
          this.players = data.payload.players;
        }
      });
      this.addSocketListener("payloadIncomplete", ( _data ) => {
        console.error("Invalid or Incomplete Payload!");
      });
    }
  },
})
