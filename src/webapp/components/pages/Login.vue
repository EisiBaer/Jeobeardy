<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/UserStore";
import { ref } from "vue";

let username = ref("");
let password = ref("");
let loginRequest = ref(false);
let errorMessage = ref("");

const router = useRouter();
const userStore = useUserStore();

function signUpButtonClicked(_event) {
  router.push("/signup");
}

function loginButtonClicked(_event) {
  loginRequest.value = true;
  userStore
    .login(username.value, password.value)
    .then((response) => {
      loginRequest.value = false;
      if (response.data.success === false) {
        errorMessage.value = response.data.error;
        setTimeout(() => {
          errorMessage.value = "";
        }, 2500);
      } else {
        userStore.setUser(response.data.user);
        router.push("/profile");
      }
    })
    .catch((err) => {
      loginRequest.value = false;
      errorMessage.value = "An error occured while logging you in";
      setTimeout(() => {
        errorMessage.value = "";
      }, 2500);
      console.debug(err);
    });
}
</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3">
      <div class="col">
        <h1 class="text-center">Login to your Jeobeardy Account!</h1>
      </div>
    </div>
    <div class="d-flex h-100 justify-content-evenly align-items-center w-100">
      <div class="d-flex flex-column m-5 justify-content-center align-items-center">
        <div class="card bg-primary login-card">
          <div class="card-header">
            <h2 class="m-2">Login</h2>
          </div>
          <div class="card-body text-center">
            <div class="d-flex flex-column h-100 w-100 align-items-center justify-content-center">
              <div class="d-flex px-3 w-100">
                <div class="w-100 text-start">
                  <label for="username" class="fs-5 mb-1">Username</label>
                  <input
                    v-model="username"
                    v-focus
                    class="form-control form-control-lg bg-gray mb-2 text-dark placeholder-dark"
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    @keyup.enter="loginButtonClicked"
                  />
                  <label for="password" class="fs-5 mb-1">Password</label>
                  <input
                    v-model="password"
                    class="form-control form-control-lg bg-gray mb-3 text-dark placeholder-dark"
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    @keyup.enter="loginButtonClicked"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-between w-100 px-3">
                <button class="btn btn-sm btn-primary text-nowrap" @click="signUpButtonClicked">Sign Up</button>
                <button class="btn btn-lg btn-pink-accent-primary text-nowrap" @click="loginButtonClicked">
                  Login
                  <font-awesome-icon v-if="!loginRequest" class="ms-1" icon="fa-solid fa-right-to-bracket" />
                  <font-awesome-icon v-else class="ms-1" icon="fa-solid fa-spinner" spin />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-warning mt-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  min-height: 20rem;
  width: 25rem;
  max-width: 90vw;
}
</style>
