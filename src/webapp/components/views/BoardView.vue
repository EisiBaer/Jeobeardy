<script setup>
import CategoryHeaderCard from '@/components/blocks/CategoryHeaderCard.vue';
import BoardEntryCard from '@/components/blocks/BoardEntryCard.vue';

const props = defineProps({
  board: Object,
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
  chosenEntry: Object,
});

const emit = defineEmits(["boardEntryClicked", "questionAnswered", "questionAnsweredRevert" ])

// function playerChosenBoardEntry( categoryIndex, boardEntryIndex ){
//   if( props.chosenEntry !== undefined && ( props.chosenEntry.categoryIndex === categoryIndex || props.chosenEntry.boardEntryIndex === boardEntryIndex ) ){
//     return props.chosenEntry.player.name;
//   } else {
//     return false;
//   }
// }

function boardEntryCardClicked( categoryIndex, boardEntryIndex ){
  if( props.isHost || props.isPlayerChoosing ){
    emit("boardEntryClicked", categoryIndex, boardEntryIndex);
  }
}

</script>

<template>
  <div class="container-fluid h-100 d-flex justify-content-center align-items-center">
    <div class="d-flex flex-column justify-content-center align-items-center mt-3 h-100 w-100">
      <h2>
        {{ board.boardName }}
      </h2>
      
      <div class="row w-100 h-100">
        <template v-for="( category, categoryIndex ) of board.categories" :key="category.name">
          <div class="col">
            <div class="d-flex flex-column h-100">
              <CategoryHeaderCard
                :categoryName="category.categoryName"
                :categoryDescription="category.categoryDescription"
              />
              <template v-for="( boardEntry, boardEntryIndex ) of category.boardEntries" :key="boardEntryIndex">
                <BoardEntryCard
                  :isHost="props.isHost"
                  :isPlayerChoosing="props.isPlayerChoosing"
                  :isBeingPlayed="props.isBeingPlayed"
                  :boardEntry="boardEntry"
                  :boardEntryIndex="boardEntryIndex"
                  :categoryIndex="categoryIndex"
                  :chosenEntry="props.chosenEntry"
                  @boardEntryCardClicked="boardEntryCardClicked( categoryIndex, boardEntryIndex )"
                  @boardEntryAnsweredClicked="emit( 'questionAnswered', categoryIndex, boardEntryIndex )"
                  @boardEntryAnsweredRevertClicked="emit( 'questionAnsweredRevert', categoryIndex, boardEntryIndex )"
                />
              </template>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
