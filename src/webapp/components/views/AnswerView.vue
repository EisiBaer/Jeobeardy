<script setup>
import { computed, onMounted, ref, watch, nextTick } from "vue";

import { useGameCreationStore } from "@/stores/GameCreationStore";
import { useRoute } from "vue-router";


const props = defineProps({
  answer: Object,
  board: Object,
  cIndex: Number,
  bEIndex: Number,
});

let route = useRoute();

const imageRef = ref(null);
let gameCreationStore = useGameCreationStore();

let getImageInGameCreationStore = computed( () => {
  return gameCreationStore.answerImages.find( imageEntry => imageEntry.cIndex === props.cIndex && imageEntry.bEIndex === props.bEIndex );
});


let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}
const API_URL = `${protocol}${hostname}/api`;


onMounted( () => {
  if( imageRef.value ){
    imageRef.value.src = API_URL + '/game/file/' + props.answer.filename;
  }
});

watch(
  () => props.bEIndex,
  ( _newVal, _oldVal ) => {
    nextTick( () => {
        if( imageRef.value ){
            imageRef.value.src = API_URL + '/game/file/' + props.answer.filename;
        }
    });
  }
)

</script>

<template>
    <template v-if="answer.answerType === 'imageAnswer'">
        <div class="d-flex justify-content-center align-items-center position-absolute bottom-0 start-0 h-100 w-100 bg-dark-primary">
            <template v-if="route.path.includes('create') && getImageInGameCreationStore !== undefined">
                <div class="h-75 w-100 text-center">
                    <img class="image-contain h-100 w-100" :src="getImageInGameCreationStore.url" loading="eager" />
                </div>
            </template>
            <template v-else-if="answer.filename">
                <div class="h-75 w-100 text-center">
                    <img ref="imageRef" class="image-contain h-100 w-100" src="" loading="eager" />
                </div>
            </template>
            <div class="d-flex justify-content-center align-items-center position-absolute bottom-0 start-50 translate-middle mt-5">
                <h3 class="bg-primary rounded-1 px-2 py-1">
                    {{ props.answer.answerText }}
                </h3>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="d-flex justify-content-center align-items-center position-absolute bottom-0 start-50 translate-middle mt-5">
            <h3 class="bg-primary rounded-1 px-2 py-1">
                {{ props.answer.answerText }}
            </h3>
        </div>
    </template>
</template>
