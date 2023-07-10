<script setup>

const props = defineProps({
  boardName: String,
  categoryAmount: {
    type: Number,
    default: 0,
  },
  questionAmount: {
    type: Number,
    default: 0,
  },
  isSelected: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(["boardCardClicked"]);

function boardCardClicked(_event) {
  if( !props.isSelected ) {
    emit("boardCardClicked");
  };
}

</script>

<template>
	<div class="card bg-primary border-1 border-pink-accent-primary-hover board-card m-3 pointer" :class="[ { 'border-pink-accent-primary': props.isSelected } ]" @click="boardCardClicked">
		<div class="card-body">
				<h5 class="mb-0 overflow-auto">{{ props.boardName }}</h5>
		</div>
	</div>
</template>

<style scoped>
.board-card {
  width: 12em;
  height: 9em;
  max-width: 90vw;
}
</style>
