<script setup>
import { computed } from 'vue';

const props = defineProps({
	objToDisplay: String,
	board: Object,
	cIndex: Number,
	bEIndex: Number,
	acceptAnswers: {
		type: Boolean,
		default: false,
	}
});

const emit = defineEmits( "lockQuestion", "revealPlayerAnswers", "letNextPlayerChoose" );

let boardEntry = computed( () => {
	if( props.objToDisplay === "BoardEntry" ){
		return props.board.categories[props.cIndex].boardEntries[props.bEIndex];
	}
	return undefined
})

function lockQuestion(){
	emit("lockQuestion");
}

function revealPlayerAnswers(){
	emit("revealPlayerAnswers");
}

function letNextPlayerChoose(){
	emit("letNextPlayerChoose");
}


</script>

<template>
	<div
        v-if="boardEntry !== undefined"
        class="d-flex flex-column justify-content-center border-top border-pink-accent-primary interaction-size"
    >
		<div class="row mx-2">
			<div class="col-12 text-center text-truncate">
				Answer: {{ boardEntry.answer.answerText }}
			</div>
		</div>
		<div class="row mx-2 mt-2" v-show="['freeTextInteraction'].includes( boardEntry.answer.answerInteraction )">
			<div class="col-xl-6 col-12">
				<button class="btn btn-pink-accent-primary w-100 h-100" @click="lockQuestion">Lock Question</button>
			</div>
			<div class="col-xl-6 col-12">
				<button class="btn btn-pink-accent-primary w-100 h-100" @click="revealPlayerAnswers" :disabled="props.acceptAnswers">Reveal All Answers</button>
			</div>
		</div>
	</div>
	<div
		v-else
		class="d-flex flex-column justify-content-center border-top border-pink-accent-primary interaction-size"
	>
		<div class="row mx-2">
			<div class="col-12 text-center">
				<button class="btn btn-pink-accent-primary" @click="letNextPlayerChoose">Let Next Player Choose</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.interaction-size{
	height: 6rem;
}
.no-resize{
	resize: none;
}
</style>
