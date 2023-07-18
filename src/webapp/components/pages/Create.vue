<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Modal } from "bootstrap";

import BoardEntryEditView from '@/components/views/BoardEntryEditView.vue'; 
import CategoryEditView from '@/components/views/CategoryEditView.vue'; 
import BoardEditView from '@/components/views/BoardEditView.vue'; 
import BoardCard from '@/components/blocks/BoardCard.vue';
import GameQuestionsView from '@/components/views/GameQuestionsView.vue';
import BoardCategoriesView from '@/components/views/BoardCategoriesView.vue';
import GameView from '@/components/views/GameView.vue';
import { useGameCreationStore } from '@/stores/GameCreationStore';
import { useUserStore } from '@/stores/UserStore';
import Board from '@/models/Board';
import Category from '@/models/Category';
import BoardEntry from '@/models/BoardEntry';
import CreateActions from '@/components/blocks/CreateActions.vue';
import GenericMultiButtonModal from '@/components/views/GenericMultiButtonModal.vue';

const router = useRouter();
const route = useRoute();
const gameCreationStore = useGameCreationStore();
const userStore = useUserStore();
let navbarHeight = ref(0);
let boardIsLoading = ref( true );
let showingBottomView = ref( true );
let showingAnswer = ref( true );
let showingQuestion = ref( true );

let categoryIndex = ref( -1 );
let boardEntryIndex = ref( -1 );
let questionIndex = ref(0);
let selectedObject = ref( null );
let saveRequestInProgress = ref( false );
let saveAndExitRequestInProgress = ref( false );
let audioInstance = ref(null);

const isBoardSelected = computed( () => {
  return selectedObject.value instanceof Board;
});
const getEditComponent = computed( () => {
  if( selectedObject.value instanceof BoardEntry ){
    return BoardEntryEditView;
  }
  if( selectedObject.value instanceof Category ){
    return CategoryEditView;
  }
  if( selectedObject.value instanceof Board ){
    return BoardEditView;
  }
  return null;
});
const getPropsForSelectedObjectEditView = computed( () => {
  if( selectedObject.value instanceof Category ){
    return {
      categoryIndex: categoryIndex.value,
    };
  }
  if( selectedObject.value instanceof BoardEntry ){
    return {
      categoryIndex: categoryIndex.value, 
      boardEntryIndex: boardEntryIndex.value,
      questionIndex: questionIndex.value,
    }
  }
  return {};
});
const getSelectedObjectType = computed( () => {
  if( selectedObject.value instanceof BoardEntry ){
    return "BoardEntry";
  }
  return "Board";
});

function boardSelected(){
  selectedObject.value = gameCreationStore.board;
  categoryIndex.value = -1;
  boardEntryIndex.value = -1;
  showingQuestion.value = true;
  showingAnswer.value = true;
}
function categorySelected( cIndex ){
  selectedObject.value = gameCreationStore.board.categories[cIndex];
  categoryIndex.value = cIndex;
  boardEntryIndex.value = -1;
}
function boardEntrySelected( entryIndex ){
  selectedObject.value = gameCreationStore.board.categories[categoryIndex.value].boardEntries[entryIndex];
  boardEntryIndex.value = entryIndex;
}
function selectBoardEntryWithCategory( cIndex, entryIndex ){
  categoryIndex.value = cIndex;
  boardEntryIndex.value = entryIndex;
  selectedObject.value = gameCreationStore.board.categories[cIndex].boardEntries[entryIndex];
}
function addNewBoardEntry(){
  if( !isBoardSelected.value ){
    gameCreationStore.addEmptyBoardEntryToCategoryOnIndex( categoryIndex.value );
    boardEntrySelected( gameCreationStore.board.categories[categoryIndex.value].boardEntries.length - 1 ); 
  }
}
function deleteBoardEntry( bEIndex ){
  if( !isBoardSelected.value ){
    gameCreationStore.deleteBoardEntry( categoryIndex.value, bEIndex );

    let boardEntriesLen = gameCreationStore.board.categories[categoryIndex.value].boardEntries.length;
    if( boardEntriesLen === 0 ){
      categorySelected( categoryIndex.value );
    } else {
      let newIdx = bEIndex;
      if( bEIndex === boardEntriesLen ){
        newIdx--;
      }
      boardEntryIndex.value = newIdx;
    }
  }
}

function specificQuestionLayerSelected( index ){
  questionIndex.value = index;
}

function playAudio( cIndex, bEIndex, qIndex ){
  let audio = gameCreationStore.audios.find( audioEntry => audioEntry.cIndex === cIndex && audioEntry.bEIndex === bEIndex && audioEntry.qIndex === qIndex.value );

    if( audio && !audioInstance.value ){
      audioInstance.value = new Audio( audio.url );
      audioInstance.value.play();
    }
}

function stopAudio(){
  if( audioInstance.value ){
    audioInstance.value.pause();
    audioInstance.value = null;
  }
}

function showQuestion(){
  showingQuestion.value = true;
}
function showAnswer(){
  showingAnswer.value = true;
}
function hideQuestion(){
  showingQuestion.value = false;
}
function hideAnswer(){
  showingAnswer.value = false;
}

function saveBoard(){
  saveRequestInProgress.value = true;
  gameCreationStore.saveBoard()
  .catch( ( error ) => {
    console.error( error );
    openModal("failedSavingModal")
  })
  .finally( () => {
    saveRequestInProgress.value = false;
  });
}

function saveBoardAndExit(){
  saveAndExitRequestInProgress.value = true;
  gameCreationStore.saveBoard()
  .then( () => {
    exitCreatePage();
  })
  .catch( ( error ) => {
    console.error( error );
    openModal("failedSavingModal")
  })
  .finally( () => {
    saveAndExitRequestInProgress.value = false;
  });
}

function handleModalButtonClick( buttonIndex ){
  switch( buttonIndex ){
    case 0:
      exitCreatePage();
      break;
    case 1:
    default:
      return;
  }
}

function exitCreatePage(){
  router.push("/profile");
}

//Maybe extract
function openModal( modalId ){
  let modalElement = document.getElementById( modalId );
  let modalInstance = Modal.getOrCreateInstance( modalElement );
  modalInstance.show();
}

function toggleBottomView(){
  showingBottomView.value = !showingBottomView.value;
}

onMounted(()=>{
  navbarHeight.value = document.getElementById("navbar").clientHeight;
});

if( route.params.boardId !== undefined ){
  userStore.userService.getBoardFromUser( route.params.boardId )
  .then( ( res ) => {
    if( res.data.success ){
      gameCreationStore.setBoardWithConversion( res.data.board );
      selectedObject.value = gameCreationStore.board;
    } else {
      console.debug( res );
    }
  })
  .catch( ( error ) => {
    console.error(error);
  })
  .finally( () => {
    boardIsLoading.value = false;
  });
} else {
  gameCreationStore.board = new Board( undefined, "New Board", [] );
  selectedObject.value = gameCreationStore.board;
  boardIsLoading.value = false;
}

</script>

<template>
  <div class="container-fluid px-0" :style="{'height': 'calc(100vh - ' + navbarHeight + 'px)'}">
    <div v-if="boardIsLoading" class="h-100 w-100 d-flex justify-content-center align-items-center">
      <font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-spinner" spin size="4x"/>
    </div>
    <template v-else>
      <div class="row h-100 w-100 mx-0">
        <div class="col-9 px-0 position-relative">
          <div class="d-flex flex-column w-100">
            <GameView 
              :objToDisplay="getSelectedObjectType"
              :board="gameCreationStore.board"
              :cIndex="categoryIndex"
              :bEIndex="boardEntryIndex"
              :questionIndex="questionIndex"
              :isQuestionRevealed="showingQuestion"
              :isAnswerRevealed="showingAnswer"
              :showingBottomView="showingBottomView"
              :isHost="true"
              @showBoard="boardSelected"
              @showQuestion="showQuestion"
              @showAnswer="showAnswer"
              @hideQuestion="hideQuestion"
              @hideAnswer="hideAnswer"
              @boardEntryClicked="selectBoardEntryWithCategory"
              @specificQuestionLayerSelected="specificQuestionLayerSelected"
              @playAudio="playAudio"
              @stopAudio="stopAudio"
            />
            <div v-if="showingBottomView" id="bottom-view" class="d-flex border-top border-2 border-pink-accent-primary">

              <div class="border-end border-1 border-pink-accent-primary">
                <BoardCard
                  :boardName="gameCreationStore.board.boardName"
                  :isSelected="isBoardSelected"
                  @boardCardClicked="boardSelected"
                />
              </div>
              <div class="d-flex border-end border-1 border-pink-accent-primary" :class="[{ 'overflow-auto': isBoardSelected }]">
                <div class="d-flex">
                  <BoardCategoriesView
                    :categories="gameCreationStore.board.categories"
                    :selectedCategoryIndex="categoryIndex"
                    :isSelected="!isBoardSelected && boardEntryIndex === -1"
                    @categorySelected="categorySelected"
                  />
                </div>
              </div>

              <template v-if="!isBoardSelected" >
                <GameQuestionsView
                :entries="gameCreationStore.board.categories[categoryIndex].boardEntries"
                :selectedEntryIndex="boardEntryIndex"
                :isEditable="true"            
                @boardEntrySelected="boardEntrySelected"
                @addNewBoardEntry="addNewBoardEntry"
                @deleteBoardEntry="deleteBoardEntry"
                />
              </template>
            </div>
          </div>
          <div class="position-absolute bottom-0 end-0 me-5">
            <div class="border border-2 border-pink-accent-primary border-bottom-0 py-2 px-3 rounded-top bg-primary pointer" @click="toggleBottomView">
              <font-awesome-icon v-if="showingBottomView" class="text-pink-accent-primary" icon="fa-solid fa-angle-down"/>
              <font-awesome-icon v-else class="text-pink-accent-primary" icon="fa-solid fa-angle-up"/>
            </div>
          </div>
        </div>
        <div class="col-3 border-start border-2 border-pink-accent-primary px-0 h-100">
          <div class="d-flex flex-column w-100 justify-content-between h-100">
            <div class="overflow-auto">
              <component :is="getEditComponent" v-bind="getPropsForSelectedObjectEditView" @questionIndexChanged="specificQuestionLayerSelected"/>
            </div>
            <div id="save-cancel-button-div" class="w-100 border-top border-pink-accent-primary">
              <CreateActions
                :saveRequestInProgress="saveRequestInProgress"
                :saveAndExitRequestInProgress="saveAndExitRequestInProgress"
                @save="saveBoard"
                @saveAndExit="saveBoardAndExit"
                @discardAndExit="openModal('discardConfirmModal')"
              />
            </div>
          </div>

        </div>
      </div>
    </template>

    <GenericMultiButtonModal
      :id="'discardConfirmModal'"
      :hasTitle="true"
      :title="'Are you sure?'"
      :modalText="'Are you sure you want to discard any changes made to the Board?'"
      :buttonList="[
        {
					text: 'Yes, discard!',
					emitsEvent: 'discardClicked',
					bgColorClass: 'btn-danger',
				},
				{
					text: 'Cancel',
					bgColorClass: 'btn-pink-accent-primary',
				},
      ]"
      @buttonClicked="handleModalButtonClick"
    />

    <GenericMultiButtonModal
      :id="'failedSavingModal'"
      :hasTitle="true"
      :title="'Failed to save'"
      :modalText="'Something went wrong while saving!'"
      :buttonList="[
				{
					text: 'Ok',
					bgColorClass: 'btn-pink-accent-primary',
				},
      ]"
    />

  </div>
</template>

<style scoped>
.height-bottom-view{
  height: 9rem;
}
</style>
