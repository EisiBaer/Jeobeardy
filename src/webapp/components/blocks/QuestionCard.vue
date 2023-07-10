<script setup>
import { computed } from 'vue';
import { QUESTION_TYPES } from '../../services/GameService';


const props = defineProps({
  boardEntry: Object,
  isSelected: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(["questionCardClicked", "questionCardDeleteClicked"]);

let questionTypes = computed( () => {
  let uniqueArray = [ ...new Set( props.boardEntry.questions.map( question => question.questionType ) ) ].map( uniqueType => QUESTION_TYPES[uniqueType] );
  return uniqueArray.join("; ");
});
let questionTexts = computed( () => {
  return props.boardEntry.questions.map( question => question.questionText ).join("; ");
});

function questionCardClicked(_event){
  emit("questionCardClicked");
}

function deleteCardClicked(_event){
  emit("questionCardDeleteClicked");
}

</script>

<template>
  <div class="card bg-primary border-1 border-pink-accent-primary-hover question-card m-3 pointer" :class="[ { 'border-pink-accent-primary' : isSelected } ]" @click="questionCardClicked">
    <div class="card-header px-2" :class="[ { 'bg-pink-accent-primary': isSelected }, { 'text-dark': isSelected } ]">
      <div class="w-100 d-flex justify-content-between">
          <h5 class="text-truncate mb-0">
            {{ questionTypes }}
          </h5>
        <span class="px-1 pointer" @click.stop="deleteCardClicked">
          <font-awesome-icon class="text-danger" icon="fa-solid fa-trash"/>
        </span>
      </div>
    </div>
    <div class="card-body p-1">
      <div class="d-flex align-items-center justify-content-center h-100">
        <div class="text-center question-card-body-text mb-0">
          {{ questionTexts }}
        </div>
      </div>
    </div>
    <div class="card-footer py-1">
      <div class="w-100 d-flex justify-content-between">  
        <span class="text-truncate">
          {{ props.boardEntry.answer.answerText }}
        </span>
        <span class="px-1 pointer" @click.stop="deleteCardClicked">
          {{ props.boardEntry.points }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-card{
  width: 16em;
  height: 9em;
  max-width: 90vw;
}
.question-card-title{
  width: 13em;
}
.question-card-footer{
  max-width: 13em;
}
.question-card-body-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>