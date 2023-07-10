<script setup>
import { ref } from "vue";

import PlayerListEntry from "@/components/blocks/PlayerListEntry.vue";

const props = defineProps({
  players: Object,
  isHost: {
    type: Boolean,
    default: false,
  },
  questionPoints: Number,
  answerInteraction: {
    type: String,
    default: "buzzerInteraction"
  },
  acceptAnswers: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits( "manualPointsAdjustment", "answerRuled", "revealPlayerAnswers" );

let buttonDivHeight = ref("3rem");
let navbarHeight = ref("4rem");
let manualAdjustmentValue = ref( 100 );

function manualPointsAdjustment( playerId, playerName, arePointsAdded ) {
  let points = ( arePointsAdded ? manualAdjustmentValue.value : -1 * manualAdjustmentValue.value );
  emit("manualPointsAdjustment", playerId, playerName, points );
}

function answerRuled( playerId, playerName, isAnswerCorrect ){
  let points = ( isAnswerCorrect ? props.questionPoints : 0 );
  let reopenQuestion;
  if( ["buzzerInteraction"].includes( props.answerInteraction ) ){
    reopenQuestion = !isAnswerCorrect;
  } else {
    reopenQuestion = false;
  }
  emit("answerRuled", playerId, playerName, points, reopenQuestion );
}

function revealPlayerAnswer( playerId ){
  emit("revealPlayerAnswers", [playerId] );
}

</script>

<template>
  <div id="board-entry-edit-view-container">
    <div class="d-flex flex-column px-3" :style="[{'height': 'calc( 100vh - ' + (navbarHeight - buttonDivHeight) + 'px)' }]">
      <div class="my-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">Players</h3>
        <div v-if="props.isHost" class="row mb-3">
					<div class="col">
            <label for="manual-adjustment-value">Manual Adjustment Value</label>
            <input v-model="manualAdjustmentValue" id="manual-adjustment-value" type="text" name="manual-adjustment-value" class="form-control form-control-sm border-pink-accent-primary">
					</div>
				</div>
        <template v-for="(player) in props.players" :key="player._id">
          <PlayerListEntry 
            :player="player"
            :isHost="props.isHost"
            :acceptAnswers="props.acceptAnswers"
            @manualPointsAdjustment="( arePointsAdded ) => manualPointsAdjustment( player._id, player.name, arePointsAdded )"
            @answerRuled="( isAnswerCorrect ) => answerRuled( player._id, player.name, isAnswerCorrect )"
            @revealPlayerAnswer="revealPlayerAnswer"
          />  
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
