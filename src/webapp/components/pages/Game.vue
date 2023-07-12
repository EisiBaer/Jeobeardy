<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import PlayersView from '@/components/views/PlayersView.vue'; 
import PlayerInteractionView from '@/components/views/PlayerInteractionView.vue'; 
import HostInteractionView from '@/components/views/HostInteractionView.vue'; 
import GameView from '@/components/views/GameView.vue';
import { useGameStore } from '@/stores/GameStore';
import Board from '@/models/Board';
import BoardEntry from '@/models/BoardEntry';

import BuzzerSound from "../../assets/sounds/buzzbuzz.mp3";
import NoBuzzerSound from "../../assets/sounds/dingdongy.mp3";
import CorrectAudio from "../../assets/sounds/correct.mp3";
import WrongAudio from "../../assets/sounds/wrong.mp3";

const gameStore = useGameStore();
const route = useRoute();
let navbarHeight = ref(0);
let boardIsLoading = ref( true );
let buzzBuzz = new Audio( BuzzerSound );
buzzBuzz.volume = 0.3
let buzzNoBuzz = new Audio( NoBuzzerSound );
buzzNoBuzz.volume = 0.7
let answerCorrectAudio = new Audio( CorrectAudio );
let answerWrongAudio = new Audio( WrongAudio );


let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}

const API_URL = `${protocol}${hostname}/api`;


let categoryIndex = ref( -1 );
let boardEntryIndex = ref( -1 );
let selectedObject = ref( null );
let questionIndexForAudio = ref(0);
let audioInstance = ref(null);
let showingAnswer = ref( false );
let showingQuestion = ref( false );


const isBoardSelected = computed( () => {
  return selectedObject.value instanceof Board;
});

const getSelectedObjectType = computed( () => {
  if( selectedObject.value instanceof BoardEntry ){
    return "BoardEntry";
  }
  return "Board";
});

const playerIsAnswering = computed( () => {
  return gameStore.players.findIndex( playerEntry => playerEntry.isAnswering && playerEntry._id === gameStore.playerId ) !== -1;
});

const anyPlayerIsAnswering = computed( () => {
  return gameStore.players.findIndex( playerEntry => playerEntry.isAnswering ) !== -1;
});


function boardSelected(){
  selectedObject.value = gameStore.board;
  categoryIndex.value = -1;
  boardEntryIndex.value = -1;
}
function selectBoardEntryWithCategory( cIndex, entryIndex ){
  categoryIndex.value = cIndex;
  boardEntryIndex.value = entryIndex;
  selectedObject.value = gameStore.board.categories[cIndex].boardEntries[entryIndex];
}

function setUpListeners(){
  gameStore.addSocketListener("boardEntrySelected", ( data ) => {
    showingAnswer.value = false;
    showingQuestion.value = false;
    selectBoardEntryWithCategory( data.payload.categoryIndex, data.payload.boardEntryIndex );
  });
  gameStore.addSocketListener("boardSelected", ( _data ) => {
    showingAnswer.value = false;
    showingQuestion.value = false;
    if( !gameStore.isHost ){
      for( let i in gameStore.players ){
        delete gameStore.players[i].currentTextAnswer;
      }
    }
    boardSelected();
  });
  gameStore.addSocketListener("pointsAdjusted", ( data ) => {
    gameStore.players = data.payload.players;
    let self = data.payload.players.find( playerEntry => playerEntry._id === gameStore.playerId );
    if( self ){
      gameStore.acceptAnswers = data.payload.acceptAnswers && self.acceptAnswers;
    } else {
      gameStore.acceptAnswers = data.payload.acceptAnswers;
    }
  });
  gameStore.addSocketListener("playerAnswerRevealed", ( data ) => {
    gameStore.setAnswersForPlayers( data.payload.revealedAnswers );
  });
  gameStore.addSocketListener("playerAnswerTextUpdated", ( data ) => {
    let playerIndex = gameStore.players.findIndex( playerEntry => playerEntry._id === data.payload.playerId );
    if( playerIndex !== -1 ){
      gameStore.players[playerIndex].currentTextAnswer = data.payload.updatedText;
    }
  });
  gameStore.addSocketListener("audioPlaying", ( _data ) => {
    if( !audioInstance.value ){
      let audioUrl = API_URL + '/game/file/' + gameStore.board.categories[categoryIndex.value].boardEntries[boardEntryIndex.value].questions[questionIndexForAudio.value].filename;
      audioInstance.value = new Audio( audioUrl );
      audioInstance.value.onended = (_event) => {
        audioInstance.value = null;
      }
      audioInstance.value.play();
    }
  });
  gameStore.addSocketListener("audioStopped", ( _data ) => {
    if( audioInstance.value ){
      audioInstance.value.pause();
      audioInstance.value = null;
    }
  });
  gameStore.addSocketListener("playerBuzzered", ( data ) => {
    playerBuzzered( data );
    if( audioInstance.value ){
      audioInstance.value.pause();
      audioInstance.value = null;
    }
  });
  gameStore.addSocketListener("questionRevealed", ( _data ) => {
    gameStore.acceptAnswers = true;
    showingQuestion.value = true;
  });
  gameStore.addSocketListener("questionHidden", ( _data ) => {
    gameStore.acceptAnswers = false;
    showingQuestion.value = false;
  });
  gameStore.addSocketListener("answerRevealed", ( _data ) => {
    gameStore.acceptAnswers = false;
    gameStore.board.categories[categoryIndex.value].boardEntries[boardEntryIndex.value].isAnswered = true;
    showingAnswer.value = true;
  });
  gameStore.addSocketListener("answerHidden", ( _data ) => {
    showingAnswer.value = false;
  });
  gameStore.addSocketListener("questionLocked", ( _data ) => {
    gameStore.acceptAnswers = false;
  });
  gameStore.addSocketListener("playerAnswersRevealed", ( data ) => {
    for( let playerAnswer of data.payload.revealedAnswers ){
      let playerIndex = gameStore.players.findIndex( playerEntry => playerEntry._id === playerAnswer.playerId );
      if( playerIndex !== -1 ) {
        gameStore.players[playerIndex].currentTextAnswer = playerAnswer.answer;
      }
    }
  });
  gameStore.addSocketListener("questionAnswered", ( data ) => {
    let cIndex = data.payload.categoryIndex;
    let bEIndex = data.payload.boardEntryIndex;
    gameStore.board.categories[cIndex].boardEntries[bEIndex].isAnswered = true;
  });
  gameStore.addSocketListener("questionNotAnswered", ( data ) => {
    let cIndex = data.payload.categoryIndex;
    let bEIndex = data.payload.boardEntryIndex;
    gameStore.board.categories[cIndex].boardEntries[bEIndex].isAnswered = false;
  });
  gameStore.addSocketListener("playerLeft", ( data ) => {
    let playerId = data.payload.player._id;
    let playerName = data.payload.player.name;
    let playerPoints = data.payload.player.points;
    if( gameStore.isHost ){
      alert( `${playerName} left the game (Points: ${playerPoints})`);
    }
    console.info(`${playerName} left the game (Points: ${playerPoints})`);
    let playerIndex = gameStore.players.findIndex( playerEntry => playerEntry._id === playerId );
    if( playerIndex !== -1 ){
      gameStore.players.splice( playerIndex, 1 );
    }
  });
  gameStore.addSocketListener("playerChoseBoardEntry", ( data ) => {
    let categoryIndex = data.payload.categoryIndex;
    let boardEntryIndex = data.payload.boardEntryIndex;
    let player = gameStore.players.find( playerEntry => playerEntry._id === data.payload.choosingPlayer );
    if( player ){
      gameStore.chosenEntry = {
        player: player,
        categoryIndex: categoryIndex,
        boardEntryIndex: boardEntryIndex,
      }
    }
  });
}

function playerBuzzered( data ){
  gameStore.acceptAnswers = false;
  if( gameStore.playerId === data.payload.playerId ){
    buzzBuzz.play();
  } else {
    if( !gameStore.isHost ){
      buzzNoBuzz.play();
    }
  }
  let playerIndex = gameStore.players.findIndex( playerEntry => playerEntry._id === data.payload.playerId );
  if( playerIndex !== -1 ){
    gameStore.players[playerIndex].isAnswering = true;
  }
}

function removeListeners(){
  gameStore.removeSocketListener("boardEntrySelected");
  gameStore.removeSocketListener("boardSelected");
  gameStore.removeSocketListener("pointsAdjusted");
  gameStore.removeSocketListener("playerAnswerRevealed");boardIsLoading
  gameStore.removeSocketListener("playerAnswerTextUpdated");
  gameStore.removeSocketListener("audioPlaying")
  gameStore.removeSocketListener("audioStopped")
  gameStore.removeSocketListener("playerBuzzered");
  gameStore.removeSocketListener("questionRevealed");
  gameStore.removeSocketListener("questionHidden");
  gameStore.removeSocketListener("answerRevealed");
  gameStore.removeSocketListener("answerHidden");
  gameStore.removeSocketListener("questionLocked");
  gameStore.removeSocketListener("playerAnswersRevealed");
  gameStore.removeSocketListener("questionAnswered");
  gameStore.removeSocketListener("questionNotAnswered");
  gameStore.removeSocketListener("playerLeft");
}

function showBoard(){
  gameStore.sendEvent( "selectBoard", {} );
}
function boardEntryClicked( cIndex, entryIndex ){
  if( gameStore.isHost ){
    gameStore.sendEvent( "selectBoardEntry", { categoryIndex: cIndex, boardEntryIndex: entryIndex } );
  } else if( gameStore.isPlayerChoosing ){
    gameStore.sendEvent( "playerChooseBoardEntry", { categoryIndex: cIndex, boardEntryIndex: entryIndex } );
  }
}

function buzzerPressed(){
  if( gameStore.acceptAnswers ){
    gameStore.sendEvent( "pressBuzzer", {} );
  }
}

function answerTextUpdated( updatedText ){
  if( gameStore.acceptAnswers ){
    gameStore.sendEvent( "updateAnswerText", { updatedText: updatedText } );
  }
}

function playAudio( _cIndex, _bEIndex, qIndex ){
  questionIndexForAudio.value = Number(qIndex);
  gameStore.sendEvent("playAudioForQuestion", {} );
}

function stopAudio(){
  if( gameStore.isHost ){
    gameStore.sendEvent("stopAudioForQuestion", {} );
  }
}

function showQuestion(){
  if( gameStore.isHost ){
    gameStore.sendEvent( "showQuestion", {} );
  }
}
function showAnswer(){
  if( gameStore.isHost ){
    gameStore.sendEvent("showAnswer", {} );
  }
}
function hideQuestion(){
  if( gameStore.isHost ){
    gameStore.sendEvent("hideQuestion", {} );
  }
}
function hideAnswer(){
  if( gameStore.isHost ){
    gameStore.sendEvent("hideAnswer", {} );
  }
}

function questionAnswered( cIndex, bEIndex ){
  let payload = {
    categoryIndex: cIndex,
    boardEntryIndex: bEIndex,
  }
  gameStore.sendEvent("questionAnswered", payload );
}
function questionAnsweredRevert( cIndex, bEIndex ){
  let payload = {
    categoryIndex: cIndex,
    boardEntryIndex: bEIndex,
  }
  gameStore.sendEvent("questionAnsweredRevert", payload );
}

function manualPointsAdjustment( playerId, playerName, points ){
  let payload = {
    reopenQuestion: false,
    playerId: playerId,
    playerName: playerName,
    pointsAdjustment: points,
  }
  gameStore.sendEvent( "addPointsToPlayer", payload );
}
function answerRuled( playerId, playerName, points, reopenQuestion ){
  let payload = {
    reopenQuestion: reopenQuestion,
    playerId: playerId,
    playerName: playerName,
    pointsAdjustment: points,
  }
  gameStore.sendEvent( "addPointsToPlayer", payload );
}

function lockQuestion(){
  gameStore.sendEvent("lockQuestion", {});
}

function revealPlayerAnswers( playerIds ){
  let payload = [];
  let ids;
  if( playerIds ){
    ids = playerIds;
  } else {
    ids = gameStore.players.map( playerEntry => playerEntry._id );
  }
  for( let playerId of ids ){
    let player = gameStore.players.find( playerEntry => playerEntry._id === playerId );
    if( player ){
      payload.push({
        playerId: player._id,
        answer: player.currentTextAnswer,
      });
    }
  }
  gameStore.sendEvent("revealPlayerAnswers", payload);
}

gameStore.getBoardToGame( route.params.gameId )
.then( () => {
  selectedObject.value = gameStore.board;
})
.catch( ( err ) => {
  console.debug( err );
  alert("An error occured while loading the board");
})
.finally( () => {
  boardIsLoading.value = false;
});

onMounted(()=>{
  setUpListeners();
  navbarHeight.value = document.getElementById("navbar").clientHeight;
});

onUnmounted( () => {
  removeListeners();
});

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm(
    'Do you really want to leave the lobby?'
  )
  // cancel the navigation and stay on the same page
  if (!answer) {
    return false
  } else {
    gameStore.closeWebSocket();
  } 
});

//TODO List:
//  -Buzzer sound
//  -Profile Pic
//  -More Question Types
//  -Players selecting BoardEntry

</script>

<template>
  <div class="container-fluid px-0" :style="{'height': 'calc(100vh - ' + navbarHeight + 'px)'}">
    <div v-if="boardIsLoading" class="h-100 w-100 d-flex justify-content-center align-items-center">
      <font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-spinner" spin size="4x"/>
    </div>
    <template v-else>
      <div class="row h-100 w-100 mx-0">
        <div class="col-9 px-0 position-relative">
          <div class="d-flex flex-column w-100">
            <GameView 
              :objToDisplay="getSelectedObjectType"
              :isQuestionRevealed="showingQuestion"
              :isAnswerRevealed="showingAnswer"
              :board="gameStore.board"
              :cIndex="categoryIndex"
              :bEIndex="boardEntryIndex"
              :showingBottomView="true"
              :isHost="gameStore.isHost"
              :isPlayerChoosing="gameStore.isPlayerChoosing"
              :anyPlayerIsAnswering="anyPlayerIsAnswering"
              :isBeingPlayed="isBeingPlayed"
              :chosenEntry="gameStore.chosenEntry"
              @showBoard="showBoard"
              @showQuestion="showQuestion"
              @showAnswer="showAnswer"
              @hideQuestion="hideQuestion"
              @hideAnswer="hideAnswer"
              @boardEntryClicked="boardEntryClicked"
              @playerBuzzered="playerBuzzered"
              @playAudio="playAudio"
              @stopAudio="stopAudio"
              @questionAnswered="questionAnswered"
              @questionAnsweredRevert="questionAnsweredRevert"
            />
          </div>
        </div>
        <div class="col-3 border-start border-2 border-pink-accent-primary px-0 h-100">
          <div class="d-flex flex-column w-100 justify-content-between h-100">
            <div class="overflow-auto">
              <PlayersView
                :players="gameStore.players"
                :questionPoints="(isBoardSelected ? 0 : Number(selectedObject.points) )"
                :answerInteraction="(isBoardSelected ? '' : selectedObject.answer.answerInteraction )"
                :isHost="gameStore.isHost"
                :acceptAnswers="gameStore.acceptAnswers && !isBoardSelected"
                @manualPointsAdjustment="manualPointsAdjustment"
                @answerRuled="answerRuled"
                @revealPlayerAnswers="revealPlayerAnswers"
              />
            </div>

            <PlayerInteractionView
              v-if="!gameStore.isHost"
              :objToDisplay="getSelectedObjectType"
              :board="gameStore.board"
              :cIndex="categoryIndex"
              :bEIndex="boardEntryIndex"
              :playerIsAnswering="playerIsAnswering"
              :acceptAnswers="gameStore.acceptAnswers"
              @buzzerPressed="buzzerPressed"
              @answerTextUpdated="answerTextUpdated"
            />
            <HostInteractionView
              v-if="gameStore.isHost"
              :objToDisplay="getSelectedObjectType"
              :board="gameStore.board"
              :cIndex="categoryIndex"
              :bEIndex="boardEntryIndex"
              :playerIsAnswering="playerIsAnswering"
              :acceptAnswers="gameStore.acceptAnswers"
              @lockQuestion="lockQuestion"
              @revealPlayerAnswers="revealPlayerAnswers"
              @questionAnswered="questionAnswered"
              @questionAnsweredRevert="questionAnsweredRevert"
            />
          </div>

        </div>
      </div>
    </template>

  </div>
</template>

<style scoped></style>
