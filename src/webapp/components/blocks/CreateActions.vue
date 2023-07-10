<script setup>

const props = defineProps({
  saveRequestInProgress: {
    type: Boolean,
    default: false,
  },
  saveAndExitRequestInProgress: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits( [ "save", "saveAndExit", "discardAndExit" ] );

function saveButtonClicked( _event ){
    emit("save");
}

function saveAndExitButtonClicked( _event ){
    emit("saveAndExit");
}

function discardAndExitButtonClicked( _event ){
    emit("discardAndExit");
}

</script>

<template>
  <div class="m-3">
    <div class="row">
      <div class="col-xl-4 col-12 px-1">
        <button class="btn btn-pink-accent-primary text-center w-100 h-100" @click="saveButtonClicked">
          <span v-show="!props.saveRequestInProgress">
            Save
          </span>
          <span v-show="props.saveRequestInProgress">
            <font-awesome-icon icon="fa-solid fa-spinner" spin />
          </span>
        </button>
      </div>
      <div class="col-xl-4 col-12 px-1">
        <button class="btn btn-pink-accent-primary text-center w-100 h-100" @click="saveAndExitButtonClicked">
          <span v-show="!props.saveAndExitRequestInProgress">
            Save & Exit
          </span>
          <span v-show="props.saveAndExitRequestInProgress">
            <font-awesome-icon icon="fa-solid fa-spinner" spin />
          </span>
        </button>
      </div>
      <div class="col-xl-4 col-12 px-1">
        <button class="btn btn-danger text-center w-100 h-100" @click="discardAndExitButtonClicked">Discard & Exit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
