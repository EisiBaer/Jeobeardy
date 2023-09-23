<script setup>

const props = defineProps({
	id: String,
	hasTitle: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		default: "Info",
	},
	modalText: {
		type: String,
		default: "Are you sure?",
	},
	buttonList: {
		type: Array,
		default(){ 
			return [
				{
					text: "Ok",
					bgColorClass: "btn-pink-accent-primary",
				},
				{
					text: "Cancel",
					bgColorClass: "btn-outline-danger",
				},
			];
		},
	},
});

const emit = defineEmits(["buttonClicked"]);

</script>

<template>
  <div class="modal fade" :id="props.id" tabindex="-1" aria-labelledby="twoBtnModalTitle" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
    		<div class="modal-content">
				<div v-if="props.hasTitle" class="modal-header">
					<h1 class="modal-title fs-5" :id="'twoBtnModalTitle'+props.title">{{ props.title }}</h1>
					<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					{{ modalText }}
				</div>
				<div class="modal-footer">
					<div class="d-flex" :class="[ { 'flex-column': props.buttonList.length > 2 } ]">
						<template v-for="(button, buttonIndex) of props.buttonList" :key="button.text">
							<button type="button" class="btn ms-3" :class="[ button.bgColorClass, { 'w-100': props.buttonList.length > 2 } ]" data-bs-dismiss="modal" @click="emit('buttonClicked', buttonIndex)">{{ button.text }}</button>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
</style>
