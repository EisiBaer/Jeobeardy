<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameCreationStore } from "@/stores/GameCreationStore";

const props = defineProps({
  questions: Array,
  board: Object,
  cIndex: Number,
  bEIndex: Number,
  questionIndex: Number,
  isHost: {
    type: Boolean,
    default: false,
  }
});

let emit = defineEmits(["specificQuestionLayerSelected", "playAudio", "stopAudio"])

const imageRef = ref([]);
let route = useRoute();
let gameCreationStore = useGameCreationStore();

let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}

const API_URL = `${protocol}${hostname}/api`;


let getImageInGameCreationStore = computed( () => {
  return gameCreationStore.images.find( imageEntry => imageEntry.cIndex === props.cIndex && imageEntry.bEIndex === props.bEIndex && imageEntry.qIndex === props.questionIndex );
})

function specificLayerSelected( index ){
  emit("specificQuestionLayerSelected", index );
}

function playAudio(){
  emit("playAudio", props.cIndex, props.bEIndex, props.questionIndex );
}


function stopAudio(){
  emit("stopAudio");
}


onMounted( () => {
  if( imageRef.value[0] ){
    imageRef.value[0].src = API_URL + '/game/file/' + props.questions[props.questionIndex].filename;
  }
});

watch(
  () => props.questionIndex,
  ( _newVal, _oldVal ) => {
    nextTick( () => {
      if( imageRef.value[0] ){
        imageRef.value[0].src = API_URL + '/game/file/' + props.questions[props.questionIndex].filename;
      }
    });
  }
)

</script>

<template>
  <template v-for="(question, questionIndex) in props.questions" :key="questionIndex">
    <div v-if="props.questionIndex === questionIndex" class="d-flex flex-column justify-content-center align-items-center h-100 w-100">
      <h1 class="text-center" :class="[{ 'white-space-show-nl': question.questionType === 'multilineQuestion'}]">
        {{ question.questionText }}
      </h1>
      <template v-if="question.questionType === 'imageQuestion'">
        <template v-if="route.path.includes('create') && getImageInGameCreationStore !== undefined">
          <div class="h-75 w-100 text-center">
            <img class="image-contain h-100 w-100" :src="getImageInGameCreationStore.url" loading="eager" />
          </div>
        </template>
        <template v-else-if="question.filename">
          <div class="h-75 w-100 text-center">
            <img ref="imageRef" class="image-contain h-100 w-100" src="" loading="eager" />
          </div>
        </template>
      </template>
      <template v-else-if="question.questionType === 'audioQuestion'">
        <div class="w-50 d-flex flex-column align-items-center justify-content-between">
          <img class="w-100" src="../../assets/images/soundform.svg" alt="Audio waveform">
          <div class="d-flex">
            <button v-if="props.isHost" class="btn btn-pink-accent-primary me-3" @click="playAudio">Play</button>
            <button v-if="props.isHost" class="btn btn-pink-accent-primary" @click="stopAudio">Stop</button>
          </div>
        </div>
      </template>
    </div>
    <div v-if="props.questions.length > 1 && props.isHost" class="d-flex justify-content-start align-items-center position-absolute bottom-0 start-0 ms-3 mb-3">
      <template v-for="(question, questionIndex) in props.questions" :key="questionIndex">
        <div>
          <button class="btn btn-sm m-1 py-1" :class="[{'btn-pink-accent-primary': props.questionIndex === Number(questionIndex) }, {'btn-outline-pink-accent-primary': props.questionIndex !== questionIndex }]" :disabled="props.questionIndex === questionIndex" @click="specificLayerSelected( questionIndex )">
            {{ questionIndex + 1 }}
          </button>
        </div>
      </template>
    </div>
  </template>
</template>

<style scoped>
.white-space-show-nl{
  white-space: pre-wrap;
}
</style>
