<script setup>
import { RouterView } from "vue-router";
import Navbar from "./components/common/Navbar.vue";
import { useUserStore } from "@/stores/UserStore";

const userStore = useUserStore();

userStore.initialUserPromise
.then( ( userData ) => {
  userStore.setUser( userData );
})
.catch( ( err ) => {
  console.debug( err );
});

</script>

<template>
  <Navbar />
  <div class="full-height-wrapper">
    <RouterView />
  </div>
</template>

<style scoped></style>
