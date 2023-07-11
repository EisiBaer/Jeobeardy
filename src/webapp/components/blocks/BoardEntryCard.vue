<script setup>
import { computed } from 'vue';


const props = defineProps({
  boardEntry: Object,
  isHost: {
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
});

const emit = defineEmits(["boardEntryCardClicked", "boardEntryAnsweredClicked", "boardEntryAnsweredRevertClicked" ]);

const showingSetAnswered = computed( () => {
  return props.isHost && props.isBeingPlayed;
})

function questionCardClicked(){
  if( !props.boardEntry.isAnswered ){
    emit("boardEntryCardClicked");
  }
}

function boardEntryAnsweredClicked(){
  emit("boardEntryAnsweredClicked");
}
function boardEntryAnsweredRevertClicked(){
  emit("boardEntryAnsweredRevertClicked");
}

</script>

<template>
  <div
    class="card border-1 mb-1 flex-fill board-entry-card bg-primary"
    :class="[ 
      { 'border-pink-accent-primary-disabled' : props.boardEntry.isAnswered },
      { 'border-pink-accent-primary' : !props.boardEntry.isAnswered },
      { 'bg-dark-primary': props.boardEntry.isAnswered },
      { 'pointer': !props.boardEntry.isAnswered && ( props.isHost || props.isPlayerChoosing ) },
    ]"
    @click="questionCardClicked"
  >
    <div class="card-body">
      <div class="d-flex justify-content-center align-items-center h-100">
        <div v-if="showingSetAnswered" class="position-absolute start-0 top-0 ms-1 mt-1">
          <button v-if="!boardEntry.isAnswered" class="btn btn-sm btn-pink-accent-primary" @click.stop="boardEntryAnsweredClicked">
            <font-awesome-icon icon="fa-solid fa-square-check" size="lg" />
          </button>
          <button v-else class="btn btn-sm btn-pink-accent-primary" @click.stop="boardEntryAnsweredRevertClicked">
            <font-awesome-icon icon="fa-solid fa-square-minus" size="lg" />
          </button>
        </div>
        <h5 class="mb-0 user-select-none">
          {{ props.boardEntry.points }}
        </h5> 
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-entry-card{
  max-height: 20%;
  max-width: 90vw;
}
</style>