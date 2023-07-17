<script setup>
import { ref, watch, nextTick } from "vue";

import { QUESTION_TYPES } from "@/services/GameService";
import { ANSWER_TYPES } from "@/services/GameService";
import { ANSWER_INTERACTION } from "@/services/GameService";
import { useGameCreationStore } from '@/stores/GameCreationStore';

const props = defineProps({
  categoryIndex: Number,
  boardEntryIndex: Number,
  questionIndex: Number,
});

const emit = defineEmits(["questionIndexChanged"]);

const gameCreationStore = useGameCreationStore();
let buttonDivHeight = ref("3rem");
let navbarHeight = ref("4rem");
let accordionButtons = ref([]);
let accordionCollapses = ref([]);


let answerImageInput = ref(null);
let questionImageInput = ref(null);


function addQuestionAbove( insertIndex ){
  gameCreationStore.addEmptyQuestionToBoardEntry( props.categoryIndex, props.boardEntryIndex, insertIndex );
}
function addQuestionBelow( insertIndex ){
  let insertIndexBelow = insertIndex + 1;
  gameCreationStore.addEmptyQuestionToBoardEntry( props.categoryIndex, props.boardEntryIndex, insertIndexBelow );
  nextTick( () => {
    setQuestionIndex( insertIndexBelow );
  })
}

function removeQuestion( removeIndex ){
  gameCreationStore.removeQuestionFromBoardEntry( props.categoryIndex, props.boardEntryIndex, removeIndex );
  if( 1 <= gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].questions.length && gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].questions.length <= removeIndex ){
    nextTick( () => {
      setQuestionIndex( removeIndex - 1 );
    });
  }
}

function questionTypeChanged( event, qIndex ){
  let newQuestionType = event.target.selectedOptions[0].value;
  gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].questions[qIndex].questionType = newQuestionType;
}

function onQuestionImageChanged( questionIndex, event ){
  let files = event.target.files || event.dataTransfer.files;
  if (!files.length){
    return;
  }

  gameCreationStore.addImageToQuestion( props.categoryIndex, props.boardEntryIndex, questionIndex, files[0]);
}

function onAnswerImageChanged( event ){
  let files = event.target.files || event.dataTransfer.files;
  if (!files.length){
    return;
  }

  gameCreationStore.addImageToAnswer( props.categoryIndex, props.boardEntryIndex, files[0]);
}

function onQuestionAudioChanged( questionIndex, event ){
  let files = event.target.files || event.dataTransfer.files;
  if (!files.length){
    return;
  }

  gameCreationStore.addAudioToQuestion( props.categoryIndex, props.boardEntryIndex, questionIndex, files[0]);
}

function setQuestionIndex( questionIndex ){
  emit("questionIndexChanged", questionIndex)
}

watch(
  () => props.questionIndex,
  ( newVal, oldVal ) => {
    if( !accordionCollapses.value[newVal].classList.contains("show") ){
      accordionButtons.value[newVal].click();
    }
  }
);
watch(
  () => props.boardEntryIndex,
  ( newVal, oldVal ) => {
    if( answerImageInput.value ){
      answerImageInput.value.value = "";
    }
    if( questionImageInput.value ){
      questionImageInput.value.value = "";
    }
  }
);

</script>

<template>
  <div id="board-entry-edit-view-container">
    <div class="d-flex flex-column px-3" :style="[{'height': 'calc( 100vh - ' + (navbarHeight - buttonDivHeight) + 'px)' }]">
      <div class="my-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">General</h3>
        <div>
          <label class="form-label fs-4 mt-3" for="question-type">Points</label>
          <input v-model="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].points" class="form-control bg-dark-blue" type="text">
        </div>
      </div>
      <div class="my-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">Question</h3>
        <div class="accordion" id="questionAccordion">
          <template v-for="(question, questionIndex) in gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].questions" :key="questionIndex">
            <div class="accordion-item">
              <h2 class="accordion-header" :id="'questionCollapseHeading' + questionIndex">
                <button
                  ref="accordionButtons"
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#questionCollapse' + questionIndex"
                  :aria-expanded="(questionIndex === props.questionIndex ? 'true' : 'false')"
                  :aria-controls="'questionCollapse' + questionIndex"
                  @click="setQuestionIndex(questionIndex)"
                >
                  Question Layer {{ 1 + questionIndex }}
                </button>
              </h2>
              <div ref="accordionCollapses" :id="'questionCollapse' + questionIndex" class="accordion-collapse collapse" :class="[{'show': questionIndex === 0 }]" :aria-labelledby="'questionCollapseHeading' + questionIndex" data-bs-parent="#questionAccordion">
                <div class="accordion-body">
                    <div>
                      <label class="form-label fs-4" for="question-type">Question Type</label>
                      <select @change="questionTypeChanged($event, questionIndex)" v-model="question.questionType" class="form-select bg-dark-blue" aria-label="Question Type" name="question-type" id="question-type">
                        <option v-for="(questionText, questionTypeKey) in QUESTION_TYPES" :key="questionTypeKey" :value="questionTypeKey">{{ questionText }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="form-label fs-4 mt-3" for="question-type">Question Text</label>
                      <template v-if="question.questionType === 'multilineQuestion'">
                        <textarea class="form-control bg-dark-blue" v-model="question.questionText">
                        </textarea>
                      </template>
                      <template v-else>
                        <input v-model="question.questionText" class="form-control bg-dark-blue" type="text">
                      </template>
                    </div>
                    <div v-if="question.questionType === 'imageQuestion'">
                      <label class="form-label fs-4 mt-3" for="question-image">Question Image</label>
                      <input class="form-control bg-dark-blue" type="file" name="question-image" id="question-image" @change="onQuestionImageChanged( questionIndex, $event )" accept="image/*">
                    </div>
                    <div v-if="question.questionType === 'audioQuestion'">
                      <label class="form-label fs-4 mt-3" for="question-audio">Question Audio</label>
                      <input ref="questionImageInput" class="form-control bg-dark-blue" type="file" name="question-audio" id="question-audio" @change="onQuestionAudioChanged( questionIndex, $event )" accept="audio/mpeg">
                    </div>
                    <div class="row mt-3">
                      <div class="col-xxl-4 col-12 mb-1 px-1">
                        <button class="btn btn-pink-accent-primary w-100 h-100" @click="addQuestionAbove(questionIndex)">Insert Above</button>
                      </div>
                      <div class="col-xxl-4 col-12 mb-1 px-1">
                        <button class="btn btn-pink-accent-primary w-100 h-100" @click="addQuestionBelow(questionIndex)">Insert Below</button>
                      </div>
                      <div class="col-xxl-4 col-12 mb-1 px-1">
                        <button class="btn btn-pink-accent-primary w-100 h-100" @click="removeQuestion(questionIndex)" :disabled="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].questions.length <= 1">Remove Layer</button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="my-3 pb-3">
        <h3 class="border-bottom border-3 border-pink-accent-primary fw-bold">Answer</h3>
        <div>
          <label class="form-label fs-4" for="answer-type">Answer Type</label>
          <select v-model="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].answer.answerType" class="form-select bg-dark-blue" aria-label="Answer Type" name="answer-type" id="answer-type">
            <option v-for="(answerText, answerTypeKey) in ANSWER_TYPES" :key="answerTypeKey" :value="answerTypeKey">{{ answerText }}</option>
          </select>
        </div>
        <div>
          <label class="form-label fs-4" for="answer-type">Answer Interaction</label>
          <select v-model="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].answer.answerInteraction" class="form-select bg-dark-blue" aria-label="Answer Interaction" name="answer-interaction" id="answer-interaction">
            <option v-for="(answerInteraction, answerInteractionKey) in ANSWER_INTERACTION" :key="answerInteractionKey" :value="answerInteractionKey">{{ answerInteraction }}</option>
          </select>
        </div>
        <div>
          <label class="form-label fs-4 mt-3" for="answer-type">Answer Text</label>
          <input v-model="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].answer.answerText" class="form-control bg-dark-blue" type="text">
        </div>
        <div v-if="gameCreationStore.board.categories[props.categoryIndex].boardEntries[props.boardEntryIndex].answer.answerType === 'imageAnswer'">
          <label class="form-label fs-4 mt-3" for="answer-image">Answer Image</label>
          <input ref="answerImageInput" class="form-control bg-dark-blue" type="file" name="answer-image" id="answer-image" @change="onAnswerImageChanged" accept="image/*">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
