<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';

import BoardView from '@/components/views/BoardView.vue';
import BoardEntryView from '@/components/views/BoardEntryView.vue';

const props = defineProps({
  objToDisplay: String,
  board: Object,
  cIndex: Number,
  bEIndex: Number,
  showingBottomView: Boolean,
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
  isPlayerChoosing: {
    type: Boolean,
    default: false,
  },
  chosenEntry: Object,
});

const emit = defineEmits(["boardEntryClicked", "specificQuestionLayerSelected", "showBoard", "playerBuzzered", "playAudio", "stopAudio",
  "showQuestion", "showAnswer", "hideQuestion", "hideAnswer", "questionAnswered", "questionAnsweredRevert" ]);

let navbarHeight = document.getElementById("navbar").offsetHeight;
let bottomViewHeight = ref("10rem");

function boardEntryClicked( categoryIndex, boardEntryIndex ){
  emit("boardEntryClicked", categoryIndex, boardEntryIndex );
}

function specificQuestionLayerSelected( qIndex ){
  emit("specificQuestionLayerSelected", qIndex );
}

function showBoard(){
  emit("showBoard");
}

function playerBuzzered( data ){
  emit("playerBuzzered", data );
}

function playAudio( cIndex, bEIndex, qIndex ){
  emit( "playAudio", cIndex, bEIndex, qIndex );
}

function stopAudio(){
  emit( "stopAudio" );
}

function showQuestion(){
  emit( "showQuestion" );
}
function showAnswer(){
  emit( "showAnswer" );
}
function hideQuestion(){
  emit( "hideQuestion" );
}
function hideAnswer(){
  emit( "hideAnswer" );
}

function questionAnswered( cIndex, bEIndex ){
  emit( "questionAnswered", cIndex, bEIndex );
}
function questionAnsweredRevert( cIndex, bEIndex ){
  emit( "questionAnsweredRevert", cIndex, bEIndex );
}

onMounted(()=>{
  let bottomViewElement = document.getElementById("bottom-view");
  if( bottomViewElement ){
    bottomViewHeight.value = document.getElementById("bottom-view").offsetHeight;
  } else {
    bottomViewHeight.value = 0;
  }
});

watch(
  () => props.showingBottomView,
  ( newVal, oldVal ) => {
    if( newVal ){
      nextTick( () => {
        let bottomViewElement = document.getElementById("bottom-view");
        if( bottomViewElement ){
          bottomViewHeight.value = document.getElementById("bottom-view").offsetHeight;
        } else {
          bottomViewHeight.value = 0;
        }
      })
    } else {
      bottomViewHeight.value = 0;
    }
  }
)

</script>

<template>
  <div class="container-fluid overflow-auto" :style="[ {'height': 'calc(100vh - (' + navbarHeight + 'px + ' + bottomViewHeight + 'px ) )'}]">
    <div class="ratio ratio-16x9">
      <div v-if="objToDisplay === 'Board'">
        <BoardView
          :board="props.board"
          :isHost="props.isHost"
          :isBeingPlayed="props.isBeingPlayed"
          :isPlayerChoosing="props.isPlayerChoosing"
          :chosenEntry="props.chosenEntry"
          @boardEntryClicked="boardEntryClicked"
          @questionAnswered="questionAnswered"
          @questionAnsweredRevert="questionAnsweredRevert"
        />
      </div>
      <div v-else>
        <BoardEntryView
          :cIndex="props.cIndex"
          :bEIndex="props.bEIndex"
          :board="props.board"
          :isHost="props.isHost"
          :isQuestionRevealed="props.isQuestionRevealed"
          :isAnswerRevealed="props.isAnswerRevealed"
          :anyPlayerIsAnswering="props.anyPlayerIsAnswering"
          :isBeingPlayed="props.isBeingPlayed"
          @showQuestion="showQuestion"
          @showAnswer="showAnswer"
          @hideQuestion="hideQuestion"
          @hideAnswer="hideAnswer"
          @backToBoard="showBoard"
          @specificQuestionLayerSelected="specificQuestionLayerSelected"
          @playAudio="playAudio"
          @stopAudio="stopAudio"
          @playerBuzzered="playerBuzzered"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
