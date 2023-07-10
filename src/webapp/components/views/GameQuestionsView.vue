<script setup>
import { ref } from 'vue';

import QuestionCard from '@/components/blocks/QuestionCard.vue';
import { useGameCreationStore } from '@/stores/GameCreationStore';

const props = defineProps({
  isEditable: {
    type: Boolean,
    default: false,
  },
  selectedEntryIndex: Number,
  entries: Object,
})

const emit = defineEmits(["boardEntrySelected", "addNewBoardEntry", "deleteBoardEntry"]);

function addBoardEntryClicked(_event) {
  emit("addNewBoardEntry");
}
function changeSelectedBoardEntry( boardEntryIndex ) {
  emit("boardEntrySelected", boardEntryIndex );
}
function deleteBoardEntry( boardEntryIndex ){
  emit("deleteBoardEntry", boardEntryIndex );
}

</script>

<template>
  <div class="d-flex overflow-auto">
    <div class="d-flex">
      <template v-for="( boardEntry, boardEntryIndex ) in props.entries" :key="boardEntryIndex">
        <QuestionCard
        :boardEntry="boardEntry"
        :isSelected="selectedEntryIndex === boardEntryIndex"
        @questionCardClicked="changeSelectedBoardEntry( boardEntryIndex )"
        @questionCardDeleteClicked="deleteBoardEntry( boardEntryIndex )"
        />
      </template>
      <div v-if="isEditable" class="card bg-primary m-3 border-1 border-pink-accent-primary-hover question-card pointer" @click="addBoardEntryClicked">
        <div class="card-body d-flex flex-column justify-content-center align-items-center text-center">
          <h4>
            Add Question
          </h4>
          <font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-plus-square" size="3x"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  height: 9rem;
  width: 16rem;
}
</style>
