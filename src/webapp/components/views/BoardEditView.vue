<script setup>
import { ref } from "vue";
import Draggable from "vue3-draggable";
import { onMounted } from "vue";

import { useGameCreationStore } from '@/stores/GameCreationStore';
import CustomTextSaveOrCancel from '@/components/blocks/CustomTextSaveOrCancel.vue';
import Category from "@/models/Category";


const gameCreationStore = useGameCreationStore();
let buttonDivHeight = ref("3rem");
let navbarHeight = ref("4rem");

let newCategoryName = ref("");

function addCategoryButtonClicked(_event){
  if( newCategoryName.value === "" ){
    return;
  }
  let category = new Category( newCategoryName.value, "New Category", [] );
  gameCreationStore.$patch((state)=>{
    state.board.categories.push( category );
  })
  newCategoryName.value = "";
  // gameCreationStore.board.categories.push( category );
}
function deleteCategoryButtonClicked( cIndex ){
  gameCreationStore.$patch((state)=>{
    state.board.categories.splice( cIndex, 1 );
  })
}

onMounted( () => {
  buttonDivHeight.value = document.getElementById("save-cancel-button-div").offsetHeight;
  navbarHeight.value = document.getElementById("board-entry-edit-view-container").offsetHeight;
});

</script>

<template>
  <div id="board-entry-edit-view-container" class="container-fluid h-100 px-0">
    <div class="d-flex flex-column px-3" :style="[{'height': 'calc( 100vh - ' + (navbarHeight - buttonDivHeight) + 'px)' }]">
      <div class="my-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">Board</h3>
        <div>
          <label class="form-label fs-4 mt-3" for="question-type">Name</label>
          <input v-model="gameCreationStore.board.boardName" class="form-control bg-dark-blue" type="text">
        </div>
        <div>
          <label class="form-label fs-4 mt-3">Categories</label>
          <div v-if="gameCreationStore.board.categories.length === 0">No categories yet</div>
          <template v-else>
            <div v-for="( category, categoryListIndex ) in gameCreationStore.board.categories" :key="category.categoryName">
              <div class="input-group mb-1">
                <span class="form-control border-pink-accent-primary">{{ category.categoryName }}</span>
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="deleteCategoryButtonClicked(categoryListIndex)">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          </template>
          <label class="form-label fs-5" for="new-category">Add category</label>
          <div class="input-group">
            <input v-model="newCategoryName" class="form-control bg-dark-blue" type="text" id="new-category" name="new-category" @keydown.enter="addCategoryButtonClicked">
            <button class="btn btn-pink-accent-primary" @click="addCategoryButtonClicked">
              <font-awesome-icon icon="fa-solid fa-square-plus" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-card {
  height: 20rem;
  width: 25rem;
}
</style>
