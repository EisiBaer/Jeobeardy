<script setup>
import { ref } from "vue";

import { useGameCreationStore } from '@/stores/GameCreationStore';
import Category from "@/models/Category";


const gameCreationStore = useGameCreationStore();

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
}
function moveUpButtonClicked( pressedIndex ){
  gameCreationStore.$patch((state)=>{
    let tmpCat = state.board.categories[pressedIndex];
    state.board.categories[pressedIndex] = state.board.categories[pressedIndex - 1];
    state.board.categories[pressedIndex - 1] = tmpCat;
  })
}
function moveDownButtonClicked( pressedIndex ){
  gameCreationStore.$patch((state)=>{
    let tmpCat = state.board.categories[pressedIndex];
    state.board.categories[pressedIndex] = state.board.categories[pressedIndex + 1];
    state.board.categories[pressedIndex + 1] = tmpCat;
  })
}
function deleteCategoryButtonClicked( cIndex ){
  gameCreationStore.$patch((state)=>{
    state.board.categories.splice( cIndex, 1 );
  })
}

</script>

<template>
  <div id="board-entry-edit-view-container" class="container-fluid h-100 px-0">
    <div class="d-flex flex-column px-3">
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
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="moveUpButtonClicked(categoryListIndex)" :disabled="categoryListIndex === 0">
                  <font-awesome-icon icon="fa-solid fa-angle-up" />
                </button>
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="moveDownButtonClicked(categoryListIndex)" :disabled="categoryListIndex === gameCreationStore.board.categories.length-1">
                  <font-awesome-icon icon="fa-solid fa-angle-down" />
                </button>
                <span class="form-control border-pink-accent-primary text-truncate">{{ category.categoryName }}</span>
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
