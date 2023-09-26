<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter, onBeforeRouteLeave, useRoute } from 'vue-router';

import { useGameStore } from '@/stores/GameStore';
import BoardListView from "@/components/views/BoardListView.vue";
import ProfilePicture from '@/components/blocks/ProfilePicture.vue';

const router = useRouter();
const route = useRoute();
const gameStore = useGameStore();

let selectedBoardId = ref("0");
let showBoardMessage = ref( false );

let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}
const API_URL = `${protocol}${hostname}/api`;


function startGame(){
  if( selectedBoardId.value !== "0" ){
    gameStore.sendEvent( "startGame", {} );
  } else {
    showBoardMessage.value = true;
  }
}

function boardSelected( id ){
  showBoardMessage.value = false;
  gameStore.sendEvent( "selectBoardForGame", { boardId: id } );
}

onMounted( () => {
  gameStore.addSocketListener("gameStarted", ( data ) => {
    if( !gameStore.isHost ){
      gameStore.isPlayerChoosing = data.payload.choosingPlayer === gameStore.playerId;
    }
    let choosingPlayerIndex = gameStore.players.findIndex( playerEntry => playerEntry._id === data.payload.choosingPlayer );
    if( choosingPlayerIndex !== -1 ){
      gameStore.players[choosingPlayerIndex].isChoosing = true;
    }
    router.push( { name: "gameWithGameId", params: { gameId: route.params.gameId } } );
  });

  gameStore.addSocketListener("boardSelectedForGame", ( data ) => {
    selectedBoardId.value = data.payload.boardId;
  });
});

onUnmounted( () => {
  gameStore.removeSocketListener("boardSelectedForGame");
  gameStore.removeSocketListener("gameStarted");
})

onBeforeRouteLeave((to, from) => {
  if( ["game", "gameWithGameId", "gameWithGameIdAndBoardId" ].includes( to.name ) ){
    return true;
  }
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

</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col d-flex justify-content-center align-items-center">
        <span class="fs-4">Gamecode: <span class="fs-3" @click="log">{{ gameStore.gameCode }}</span></span>
      </div>
    </div>
    <div class="row my-3">
      <div class="col text-center">
        Waiting for host to start
        <font-awesome-icon class="ms-1" icon="fa-solid fa-spinner" spin />
      </div>
    </div>
    <template v-if="gameStore.isHost" >
      <div class="row">
        <div class="col">
          <BoardListView
            :selectedBoard="selectedBoardId"
            @boardSelected="boardSelected"
          />
        </div>
      </div>
      <div v-show="showBoardMessage" class="row">
        <div class="col">
          <div class="d-flex justify-content-center align-items-center">
            <div class="d-flex justify-content-center align-items-center bg-wrong-accent-primary px-2 py-1 rounded">
              <font-awesome-icon class="me-1" icon="fa-solid fa-circle-exclamation" />
              <span>
                Please select a board before starting the game
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-if="gameStore.isHost" class="row my-3">
      <div class="col text-center">
        <button class="btn btn-pink-accent-primary" @click="startGame">
          <span class="align-middle">
            Start Game
          </span>
          <font-awesome-layers class="ms-1" fixed-width>
            <font-awesome-icon icon="fa-solid fa-square" size="xl" />
            <font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-play" size="sm" />
            <!-- <font-awesome-icon class="align-middle border-dark rounded" icon="fa-solid fa-play" border /> -->
          </font-awesome-layers>
        </button>
      </div>
    </div>
    <div v-if="gameStore.players.length === 0" class="row">
      <div class="col">
        <div class="d-flex justify-content-center align-items-center">
          No Players in the lobby, yet.
        </div>
      </div>
    </div>
    <div v-else class="row">
      <template v-for="(player, playerIdx) in gameStore.players" :key="player.id">
        <div class="col-4 my-3">
          <div class="card bg-primary">
            <div class="card-body fs-4 text-center">
              <div class="d-flex justify-content-center align-items-center">
                <ProfilePicture 
                :srcOverride="API_URL + '/user/pfp/' + player.pfpFilename"
                :sizing="'2.5em'"
                />
                <span class="ms-3">
                  {{ playerIdx + 1 }} - {{ player.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
