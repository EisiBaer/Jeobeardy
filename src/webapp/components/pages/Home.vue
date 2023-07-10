<script setup>
import { useGameStore } from "@/stores/GameStore";
import { useUserStore } from "@/stores/UserStore";
import { useRouter } from "vue-router";
import { ref } from "vue";

const gameStore = useGameStore();
const userStore = useUserStore();
const router = useRouter();

let errorMessageJoin = ref("");
let errorMessageHost = ref("");
let joinRequest = ref(false);
let hostRequest = ref(false);

let gameCodeInput = ref("");

function hostButtonClicked(_event) {
  if( !userStore.loggedIn ){
    router.push("/login");
    return;
  }

  hostRequest.value = true;

  gameStore.setupNewHostGame()
  .then( (res) => {
    return gameStore.setupWebsocket();
  })
  .then( () => {
    return gameStore.hostNewGame()
  })
  .then( ( gameId ) => {
    router.push("/lobby/" + gameId);
  })
  .catch( (err) => {
    console.error( err );
    errorMessageHost.value = "An unexpected error occured: " + err;
    setTimeout( () => {
      errorMessageHost.value = "";
    }, 2500);
  })
  .finally( () => {
    hostRequest.value = false;
  });
}

function joinButtonClicked(_event) {
  joinRequest.value = true;
  gameStore.prepareGameWithCode( gameCodeInput.value )
  .then( () => {
    return gameStore.setupWebsocket();
  })
  .then( res => {
    router.push("/join");
  })
  .catch( err => {
    errorMessageJoin.value = err.message;
    setTimeout( () => {
      errorMessageJoin.value = "";
    }, 2500);
    console.error(err);
  })
  .finally( () => {
    joinRequest.value = true;
  });
}

</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3 mb-5">
      <div class="col">
        <h1 class="text-center">Welcome to Jeobeardy!</h1>
      </div>
    </div>
    <div class="row">
    <!-- <div class="d-flex h-100 justify-content-evenly align-items-top w-100"> -->
      <div class="col-12 col-md-6 mb-5 mb-md-0 d-flex flex-column justify-content-start align-items-center">
        <!-- <RouterLink to="/join" class="text-decoration-none fw-bold"> -->
        <div class="card bg-primary home-card">
          <div class="card-header">
            <h2 class="m-2">Join a Game</h2>
          </div>
          <div class="card-body text-center">
            <div class="d-flex flex-column h-100">
              <div class="fs-4 flex-grow-1 d-flex align-items-center justify-content-center">
                Enter the Code you get from your host and join the lobby
              </div>
              <div class="d-flex px-3">
                <div class="flex-grow me-3">
                  <input v-model="gameCodeInput" class="form-control form-control-lg bg-gray text-center text-dark" type="text" name="game-id" id="game-id" />
                </div>
                <div>
                  <button class="btn btn-lg btn-pink-accent-primary text-nowrap" @click="joinButtonClicked">
                    Join<font-awesome-icon class="ps-1" icon="fa-solid fa-right-to-bracket" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-warning mt-3">
          {{ errorMessageJoin }}
        </div>
        <!-- </RouterLink> -->
      </div>
      <div class="col-12 col-md-6 d-flex flex-column justify-content-start align-items-center">
        <div class="card bg-primary home-card">
          <div class="card-header">
            <h2 class="m-2">Host a Game</h2>
          </div>
          <div class="card-body text-center">
            <div class="d-flex flex-column h-100">
              <div class="fs-4 flex-grow-1 d-flex align-items-center justify-content-center">
                Create a Lobby for your friends to join. You host the game!
              </div>
              <div class="px-3">
                <button class="btn btn-lg btn-pink-accent-primary" @click="hostButtonClicked">
                  Host
                  <font-awesome-icon v-if="!hostRequest" class="ms-1" icon="fa-solid fa-users" />
                  <font-awesome-icon v-else class="ms-1" icon="fa-solid fa-spinner" spin />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-warning mt-3">
          {{ errorMessageHost }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-card {
  height: 20rem;
  width: 25rem;
  max-width: 90vw;
}
</style>
