<script setup>
import { ref, computed } from 'vue';


const props = defineProps({
	objToDisplay: String,
	board: Object,
	cIndex: Number,
	bEIndex: Number,
	playerIsAnswering: Boolean,
	acceptAnswers: {
		type: Boolean,
		default: false,
	}
});

const emit = defineEmits(["buzzerPressed", "answerTextUpdated"]);

let userText = ref("");


let boardEntry = computed( () => {
	if( props.objToDisplay === "BoardEntry" ){
		return props.board.categories[props.cIndex].boardEntries[props.bEIndex];
	}
	return undefined
})

function buzzeredTheBuzzBuzz(){
	emit("buzzerPressed");
}
function answerTextUpdated(){
	emit("answerTextUpdated", userText.value);
}


</script>

<template>
	<div v-if="boardEntry !== undefined" class="d-flex justify-content-center align-items-center border-top border-pink-accent-primary interaction-size">
		<div
			v-if="boardEntry.answer.answerInteraction === 'buzzerInteraction'"
			class="buzzer d-flex justify-content-center align-items-center rounded-circle shadow m-2"
			:class="[ { 'buzzer-answering': props.playerIsAnswering }, { 'bg-gray': !props.acceptAnswers && !props.playerIsAnswering } ]"
			@click="buzzeredTheBuzzBuzz"
		>
			Buzzer
		</div>
		<div v-else class="d-flex justify-content-center align-items-center w-100 h-100 m-3">
			<div class="w-100">
				<label for="textarea-player-input" class="form-label">Answer:</label>
				<textarea
					v-model="userText"
					type="text"
					name="textarea-player-input"
					class="form-control no-resize"
					:class="[ { 'border-pink-accent-primary': props.acceptAnswers }, { 'border-0': !props.acceptAnswers }, ]"
					rows="4"
					@input="answerTextUpdated"
					:disabled="!props.acceptAnswers"
				></textarea>
			</div>
		</div>
	</div>
</template>

<style scoped>
.interaction-size{
	height: 12rem;
}
.no-resize{
	resize: none;
}
</style>
