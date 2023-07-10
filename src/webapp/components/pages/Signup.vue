<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/UserStore";
import { ref } from "vue";

let username = ref("");
let password = ref("");
let passwordCheck = ref("");
let signupRequest = ref(false);
let errorMessage = ref("");

const router = useRouter();
const userStore = useUserStore();

function singUpButtonClicked(_event) {
  if( !areInputsValid() ){
    return;
  }

  signupRequest.value = true;
  userStore.signup(username.value, password.value)
  .then((response) => {
    signupRequest.value = false;
    if (response.data.success === false) {
      errorMessage.value = response.data.error;
      setTimeout(() => {
        errorMessage.value = "";
      }, 2500);
    } else {
      userStore.setUser(response.data.user);
      router.push("/");
    }
  })
  .catch((err) => {
    signupRequest.value = false;
    errorMessage.value = "Something went wrong while Signing you up!";
    setTimeout(() => {
      errorMessage.value = "";
    }, 2500);
    console.debug(err);
  });
  
}

function areInputsValid(){
  let isValid = true;
  if( password.value !== passwordCheck.value){
    isValid = false;
    errorMessage.value = "Passwords are not identical";
  }
  if( passwordCheck.value === "" ){
    isValid = false;
    errorMessage.value = "Password check is empty";
  }
  if( password.value === "" ){
    isValid = false;
    errorMessage.value = "Password is empty";
  }
  if( username.value === "" ){
    isValid = false;
    errorMessage.value = "Username is empty";
  }
  if( !isValid ){
    setTimeout(() => {
      errorMessage.value = "";
    }, 2500);
  }
  return isValid;
}

</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3">
      <div class="col">
        <h1 class="text-center">Sign up to Jeobeardy!</h1>
      </div>
    </div>
    <div class="d-flex h-100 justify-content-evenly align-items-center w-100">
      <div class="d-flex flex-column m-5 justify-content-center align-items-center">
        <div class="card bg-primary signup-card">
          <div class="card-header">
            <h2 class="m-2">Create User</h2>
          </div>
          <div class="card-body text-center">
            <div class="d-flex flex-column h-100 w-100 align-items-center justify-content-center">
              <div class="d-flex px-3 w-100">
                <div class="w-100 text-start">
                  <label for="username" class="fs-5 mb-1">Username</label>
                  <input
                    v-model="username"
                    v-focus
                    class="form-control form-control-lg bg-gray text-left mb-2 text-dark"
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    @keyup.enter="singUpButtonClicked"
                  />
                  <label for="password" class="fs-5 mb-1">Password</label>
                  <input
                    v-model="password"
                    class="form-control form-control-lg bg-gray text-left mb-3 text-dark"
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    @keyup.enter="singUpButtonClicked"
                  />
                  <input
                    v-model="passwordCheck"
                    class="form-control form-control-lg bg-gray text-left mb-3 text-dark"
                    type="password"
                    name="passwordCheck"
                    id="passwordCheck"
                    placeholder="Re-Enter Password"
                    @keyup.enter="singUpButtonClicked"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-end w-100 px-3">
                <button class="btn btn-lg btn-pink-accent-primary text-nowrap" @click="singUpButtonClicked">
                  Sign Up
                  <font-awesome-icon v-if="!signupRequest" class="ms-1" icon="fa-solid fa-user-plus" />
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
.signup-card {
  min-height: 20rem;
  width: 25rem;
  max-width: 90vw;
}
</style>
