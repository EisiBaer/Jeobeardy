<script setup>
import { computed } from 'vue';

import QuestionView from "@/components/views/QuestionView.vue"
import AnswerView from "@/components/views/AnswerView.vue"

const props = defineProps({
  board: Object,
  categoryName: String,
  cIndex: Number,
  bEIndex: Number,
  isHost: {
    type: Boolean,
    default: false,
  },
  isQuestionRevealed: {
    type: Boolean,
    default: false,
  },
  isAnswerRevealed: {
    type: Boolean,
    default: false,
  },
  anyPlayerIsAnswering: {
    type: Boolean,
    default: false,
  },
  isBeingPlayed: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["specificQuestionLayerSelected", "backToBoard", "playerBuzzered", "playAudio", "stopAudio", "showQuestion", "showAnswer", "hideQuestion", "hideAnswer" ]);

let boardEntry = computed( () => {
  return props.board.categories[props.cIndex].boardEntries[props.bEIndex];
})

const showingQuestion = computed( () => {
  return props.isAnswerRevealed || ( props.isQuestionRevealed && !props.anyPlayerIsAnswering );
});

function showQuestion(){
  emit("showQuestion");
}

function hideQuestion(){
  emit("hideQuestion");
}
function showAnswer(){
  emit("showAnswer");
}

function hideAnswer(){
  emit("hideAnswer");
}

function backToBoard(){
  emit("backToBoard");
}

function specificQuestionLayerSelected( index ){
  emit("specificQuestionLayerSelected", index );
}

function playAudio( cIndex, bEIndex, qIndex ){
  emit("playAudio", cIndex, bEIndex, qIndex );
}

function stopAudio(){
  emit( "stopAudio" );
}

</script>

<template>
  <div class="container-fluid h-100 d-flex justify-content-center align-items-center">
    <div v-show="showingQuestion" class="w-100 h-100">
      <QuestionView
      :cIndex="props.cIndex"
      :bEIndex="props.bEIndex"
      :questions="boardEntry.questions"
      :board="props.board"
      :isHost="props.isHost"
      @specificQuestionLayerSelected="specificQuestionLayerSelected"
      @playAudio="playAudio"
      @stopAudio="stopAudio"
      />
    </div>
    <div v-show="props.isAnswerRevealed">
      <AnswerView
        :answer="boardEntry.answer"
      />
    </div>

    <div class="position-absolute bottom-0 end-0 mb-2">
      <span class="fs-2 fw-bold">
        {{ boardEntry.points }}
      </span>
    </div>
    <div class="position-absolute top-0 start-0 mt-2">
      <span class="fs-2 fw-bold">
        {{ props.board.categories[props.cIndex].categoryName }}
      </span>
    </div>
    <div v-if="props.isHost" class="position-absolute top-0 start-50 translate-middle-x mt-2">
      <button class="btn btn-sm btn-outline-pink-accent-primary" @click="backToBoard">
        Back to Board
      </button>
    </div>
    <div v-if="props.isHost" class="position-absolute top-0 end-0 mt-2">
      <div class="me-3 d-inline-block">
        <template v-if="!props.isQuestionRevealed">
          <button class="btn btn-sm btn-outline-pink-accent-primary" @click="showQuestion">
            Show Question
          </button>
        </template>
        <template v-else>
          <button class="btn btn-sm btn-outline-pink-accent-primary" @click="hideQuestion">
            Hide Question
          </button>
        </template>
      </div>
      <div class="d-inline-block">
        <template v-if="!props.isAnswerRevealed">
          <button class="btn btn-sm btn-outline-pink-accent-primary" @click="showAnswer">
            Show Answer
          </button>
        </template>
        <template v-else>
          <button class="btn btn-sm btn-outline-pink-accent-primary" @click="hideAnswer">
            Hide Answer
          </button>
        </template>
      </div>
    </div>  
  </div>
</template>

<style scoped>
</style>
