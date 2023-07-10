<script setup>
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/UserStore";
import { useGameStore } from "@/stores/GameStore";
import { ref } from "vue";

let errorMessage = ref("");
let playerName = ref("");
let joinRequest = ref(false);
let forwardTo = { name: "gameLobby", params: { gameId: -1 } };

const router = useRouter();
const route = useRoute();
const gameStore = useGameStore();

function joinButtonClicked(_event) {
  if( joinRequest.value === true ){
    return;
  }
  joinRequest.value = true;
  gameStore.joinGame( playerName.value )
  .then( ( gameId ) => {
    forwardTo.params.gameId = gameId;
    router.push( forwardTo );
  })
  .catch( ( err ) => {
    errorMessage.value = err.message;
  })
  .finally( () => {
    joinRequest.value = false;
  });
}

let gameId = route.params.gameId;
if( gameId ){
  joinRequest.value = true;
  let localIsHost = false;
  gameStore.checkExistingGame( gameId )
  .then( ( data ) => {
    localIsHost = data.isHost;
    switch( data.gameState ){
      case "IN_LOBBY":
        forwardTo.name = "gameLobby";
        break;
      case "IN_PROGRESS":
        forwardTo.name = "gameWithGameId";
        break;
      case "ENDED":
        throw new Error("Game already ended");
      case "CREATED":
        throw new Error("Game is not yet ready to accept join requests");
    }
    return gameStore.setupWebsocket();
  })
  .then( () => {
    if( localIsHost ){
      return gameStore.continueHosting();
    } else {
      return false;
    }
  })
  .then( ( gameId ) => {
    if( gameId !== false ){
      router.push( { name: "gameWithGameId", params: { gameId: gameId } } );
    }
  })
  .catch( ( err ) => {
    console.debug( err );
    alert(err);
  })
  .finally( () => {
    joinRequest.value = false;
  })
}


</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3">
      <div class="col">
        <h1 class="text-center">Choose your username for this Jeobeardy game!</h1>
      </div>
    </div>
    <div class="d-flex h-100 justify-content-evenly align-items-center w-100">
      <div class="d-flex w-100 m-5 justify-content-center">
        <div class="card bg-primary join-card">
          <div class="card-header text-center">
            <h2 class="m-2">Choose a Username</h2>
          </div>
          <div class="card-body text-center">
            <div class="d-flex flex-column h-100 w-100 align-items-center justify-content-center">
              <div class="d-flex px-3 w-100">
                <div class="w-100 text-start">
                  <label for="username" class="fs-5 mb-1">Username</label>
                  <input
                    v-model="playerName"
                    v-focus
                    class="form-control form-control-lg bg-gray text-left mb-2 text-dark"
                    type="text"
                    name="playername"
                    id="playername"
                    placeholder="Username"
                    @keyup.enter="joinButtonClicked"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-center w-100 px-3">
                <button class="btn btn-lg btn-pink-accent-primary text-nowrap" @click="joinButtonClicked">
                  Join
                  <font-awesome-icon v-if="!joinRequest" class="ms-1" icon="fa-solid fa-right-to-bracket" />
                  <font-awesome-icon v-else class="ms-1" icon="fa-solid fa-spinner" spin />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-warning">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join-card {
  min-height: 20rem;
  min-width: 25rem;
}
</style>
