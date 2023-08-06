<script setup>
import { useGameCreationStore } from '@/stores/GameCreationStore';

const props = defineProps({
  categoryIndex: Number,
})

const gameCreationStore = useGameCreationStore();

function moveUpButtonClicked( pressedIndex ){
  gameCreationStore.$patch((state)=>{
    let tmpCat = state.board.categories[props.categoryIndex].boardEntries[pressedIndex];
    state.board.categories[props.categoryIndex].boardEntries[pressedIndex] = state.board.categories[props.categoryIndex].boardEntries[pressedIndex - 1];
    state.board.categories[props.categoryIndex].boardEntries[pressedIndex - 1] = tmpCat;
  })
}

function moveDownButtonClicked( pressedIndex ){
  gameCreationStore.$patch((state)=>{
    let tmpCat = state.board.categories[props.categoryIndex].boardEntries[pressedIndex];
    state.board.categories[props.categoryIndex].boardEntries[pressedIndex] = state.board.categories[props.categoryIndex].boardEntries[pressedIndex + 1];
    state.board.categories[props.categoryIndex].boardEntries[pressedIndex + 1] = tmpCat;
  })
}

function deleteBoardEntryButtonClicked( pressedIndex ){
  gameCreationStore.$patch((state)=>{
    state.board.categories[props.categoryIndex].boardEntries.splice( pressedIndex, 1 );
  })
}

</script>

<template>
  <div id="board-entry-edit-view-container" class="container-fluid h-100 px-0">
    <div class="d-flex flex-column px-3">
      <div class="my-3 pb-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">Category</h3>
        <div>
          <label class="form-label fs-4" for="category-name-input">Catogry Name</label>
          <input v-model="gameCreationStore.board.categories[props.categoryIndex].categoryName" class="form-control bg-dark-blue" type="text" name="category-name-input" id="category-name-input">
        </div>
        <div>
          <label class="form-label fs-4 mt-3" for="category-description-input">Category Description</label>
          <textarea v-model="gameCreationStore.board.categories[props.categoryIndex].categoryDescription" class="form-control bg-dark-blue" type="text" rows="3" name="category-description-input" id="category-description-input" />
        </div>
        <div>
          <label class="form-label fs-4 mt-3">Questions</label>
          <div v-if="gameCreationStore.board.categories.length === 0">No questions yet</div>
          <template v-else>
            <div v-for="( boardEntry, boardEntryIndex ) in gameCreationStore.board.categories[props.categoryIndex].boardEntries" :key="boardEntryIndex">
              <div class="input-group mb-1">
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="moveUpButtonClicked(boardEntryIndex)" :disabled="boardEntryIndex === 0">
                  <font-awesome-icon icon="fa-solid fa-angle-up" />
                </button>
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="moveDownButtonClicked(boardEntryIndex)" :disabled="boardEntryIndex === gameCreationStore.board.categories[props.categoryIndex].boardEntries.length-1">
                  <font-awesome-icon icon="fa-solid fa-angle-down" />
                </button>
                <span class="form-control border-pink-accent-primary text-truncate">{{ boardEntry.answer.answerText + " (" + boardEntry.points + " points)" }}</span>
                <button tabindex="-1" class="btn btn-pink-accent-primary" @click="deleteBoardEntryButtonClicked(boardEntryIndex)">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
