<script setup>
import { useRouter } from 'vue-router';

import BoardListView from '@/components/views/BoardListView.vue';
import UserCustomizationView from '@/components/views/UserCustomizationView.vue';
import { useUserStore } from "@/stores/UserStore";
import { useLoginCheck } from "@/composables/loginCheck";


useLoginCheck();

const router = useRouter();
const userStore = useUserStore();

function boardSelected( boardId ){
  if( boardId ){
    router.push({
      name: "createBoardWithParams",
      params: { boardId: boardId },
    });
  } else {
    router.push( { name: "createBoard" });
  }
}

</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3">
      <div class="col">
        <h1 class="text-center">Hi, {{ userStore.username }}!</h1>
      </div>
    </div>
    <BoardListView @boardSelected="boardSelected"/>
    <div class="row">
      <div class="col">
        <button class="btn btn-pink-accent-primary" @click="boardSelected()">
          New Board
          <font-awesome-icon icon="fa-solid fa-plus-square" />
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <UserCustomizationView />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
