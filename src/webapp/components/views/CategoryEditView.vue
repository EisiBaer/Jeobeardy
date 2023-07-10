<script setup>
import { ref } from "vue";

import { useGameCreationStore } from '@/stores/GameCreationStore';
import CustomTextSaveOrCancel from '@/components/blocks/CustomTextSaveOrCancel.vue';
import { onMounted, watch } from "vue";

const props = defineProps({
  categoryIndex: Number,
})

const gameCreationStore = useGameCreationStore();
let buttonDivHeight = ref("3rem");
let navbarHeight = ref("4rem");


onMounted( () => {
  buttonDivHeight.value = document.getElementById("save-cancel-button-div").offsetHeight;
  navbarHeight.value = document.getElementById("board-entry-edit-view-container").offsetHeight;
});

</script>

<template>
  <div id="board-entry-edit-view-container" class="container-fluid h-100 px-0">
    <div class="d-flex flex-column px-3" :style="[{'height': 'calc( 100vh - ' + (navbarHeight - buttonDivHeight) + 'px)' }]">
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
      </div>
    </div>
  </div>
</template>

<style scoped></style>
