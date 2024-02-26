<script setup>
import ProfilePicture from '@/components/blocks/ProfilePicture.vue';
import defaultPfp from '@/assets/images/PFP_BearHead.svg';

const props = defineProps({
  player: Object,
  isHost: {
	type: Boolean,
	default: false,
  },
  acceptAnswers: {
	type: Boolean,
	default: false,
  },
  isEntryShown: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["manualPointsAdjustment", "answerRuled", "revealPlayerAnswer", "letPlayerChoose"]);

let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}
const API_URL = `${protocol}${hostname}/api`;

function revealAnswer(){
	emit("revealPlayerAnswer", props.player._id);
}

function letPlayerChoose(){
	emit("letPlayerChoose", props.player._id);
}

</script>

<template>
	<div class="card bg-primary my-1 player-card">
		<div class="card-body p-2">
			<div class="row">
				<div class="col position-relative">
					<div class="d-flex justify-content-start align-content-center">
						<template v-if="props.player.isAnswering">
							<span class="align-self-center me-2">
								<font-awesome-layers :title="'Player is answering'">
									<font-awesome-icon class="text-pink-accent-primary" icon="fa-solid fa-square" size="lg" fade style="--fa-animation-duration:2s" />
									<font-awesome-icon class="text-white" icon="fa-solid fa-angle-right" size="sm" />
								</font-awesome-layers>
							</span>
						</template>
						<ProfilePicture 
							:sizing="'2em'"
							:srcOverride="(props.player.pfpFilename ? API_URL + '/user/pfp/' + props.player.pfpFilename : defaultPfp)"
						/>
						<h5 class="mb-0 ms-2 text-truncate align-self-center">
							{{ props.player.name }}
						</h5>
						<span
							v-show="props.player.isChoosing === true"
							class="position-absolute end-0 top-50 translate-middle-y bg-pink-accent-primary rounded-1 me-2 px-1"
							>
							<font-awesome-icon class="text-light" icon="fa-solid fa-hand-pointer" />
						</span>
					</div>
				</div>
			</div>

			<div v-if="props.isHost || props.player.currentTextAnswer" class="row mt-2">
				<div class="col-sm-2 text-nowrap">
					Answer
				</div>
				<div class="col-sm-10">
					<input type="text" class="form-control form-control-sm border-0" :value="props.player.currentTextAnswer" readonly>
				</div>
			</div>
			<div v-if="props.isHost" class="row mt-2">
				<div class="col-sm-2 text-nowrap d-flex justify-content-start align-items-center">
					Actions
				</div>
				<div class="col-sm-5 text-center">
					<button class="btn btn-sm btn-pink-accent-primary w-100 h-100" @click="revealAnswer" :disabled="!props.isEntryShown || props.acceptAnswers">Reveal Answer</button>
				</div>
				<div class="col-sm-5 text-center">
					<button class="btn btn-sm btn-pink-accent-primary w-100 h-100" @click="letPlayerChoose" :disabled="props.isEntryShown">Let Choose</button>
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
