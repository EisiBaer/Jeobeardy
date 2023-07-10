<script setup>

const props = defineProps({
  player: Object,
  isHost: {
	type: Boolean,
	default: false,
  },
  acceptAnswers: {
	type: Boolean,
	default: false,
  }
});

const emit = defineEmits(["manualPointsAdjustment", "answerRuled", "revealPlayerAnswer"]);

function revealAnswer(){
	emit("revealPlayerAnswer", props.player._id);
}

</script>

<template>
	<div class="card bg-primary my-1 player-card">
		<div class="card-body p-2">
			<h5 class="mb-0 text-truncate">
				<template v-if="props.player.isAnswering">
					<font-awesome-layers :title="'Player is answering'">
						<font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-square" size="lg" fade style="--fa-animation-duration:2s" />
						<font-awesome-icon class="text-white" icon="fa-solid fa-angle-right" size="sm" />
					</font-awesome-layers>
				</template>
				{{ props.player.name }}
			</h5>

			<div v-if="props.isHost || props.player.currentTextAnswer" class="row mt-2">
				<div class="col-sm-2 text-nowrap">
					Answer
				</div>
				<div class="col-sm-10">
					<input type="text" class="form-control form-control-sm border-0" :value="props.player.currentTextAnswer" readonly>
				</div>
			</div>
			<div v-if="props.isHost && !props.acceptAnswers" class="row mt-2">
				<div class="col-sm-2 text-nowrap d-flex justify-content-start align-items-center">
					Reveal
				</div>
				<div class="col-sm-10">
					<button class="btn btn-sm btn-pink-accent-primary" @click="revealAnswer">Reveal Answer</button>
				</div>
			</div>
			<div class="row mt-2">
				<div class="col-sm-2 d-flex justify-content-start align-items-center">
					<span>Points</span>
				</div>
				<div class="col-sm-10 d-flex">
					<input type="text" class="form-control form-control-sm border-0" readonly :value="props.player.points">
					<template v-if="props.isHost">
						<button class="btn btn-sm btn-pink-accent-primary mx-1" @click="emit('manualPointsAdjustment', true )">
							<font-awesome-icon class="text-black" icon="fa-solid fa-plus"/>
						</button>
						<button class="btn btn-sm btn-pink-accent-primary" @click="emit('manualPointsAdjustment', false )">
							<font-awesome-icon class="text-black" icon="fa-solid fa-minus"/>
						</button>
					</template>
				</div>
			</div>
			<div v-if="props.isHost && props.player.isAnswering" class="row mt-2">
				<div class="col-sm-2 d-flex justify-content-start align-items-center">
					Award
				</div>
				<div class="col-sm-10">
					<div class="d-flex justify-content-evenly align-items-center">
						<div class="flex-fill d-grid me-1">
							<button class="btn btn-sm btn-correct-accent-primary flex-fill-1" @click="emit('answerRuled', true )">Correct Answer</button>
						</div>
						<div class="flex-fill d-grid ms-1">
							<button class="btn btn-sm btn-wrong-accent-primary flex-fill-1" @click="emit('answerRuled', false )">Wrong Answer</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
