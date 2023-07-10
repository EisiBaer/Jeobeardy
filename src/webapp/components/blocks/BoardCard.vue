<script setup>

const props = defineProps({
  boardName: String,
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["boardCardClicked"]);

function boardCardClicked(_event) {
  emit("boardCardClicked");
}

</script>

<template>
	<div class="card bg-primary border-1 border-pink-accent-primary-hover board-card m-3 pointer" :class="[ { 'border-pink-accent-primary' : isSelected } ]" @click="boardCardClicked">
		<div class="card-header" :class="[{ 'bg-pink-accent-primary': isSelected }, { 'text-dark': isSelected }]">
				<h5 class="mb-0 text-truncate">{{ props.boardName }}</h5>
		</div>
		<div class="card-body">
			<div class="d-flex flex-column align-items-center justify-content-center h-100">
				<font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-border-all" size="2x" />
				<h5>
					Edit Board
				</h5>
			</div>
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
