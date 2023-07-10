<script setup>
import { ref } from "vue";

import { useUserStore } from "@/stores/UserStore";
import BoardListCard from "@/components/blocks/BoardListCard.vue";

const props = defineProps({
	selectedBoard: {
		type: String,
		default: "",
	}
})

const emit = defineEmits(["boardSelected"]);

const userStore = useUserStore();
const userBoards = ref([]);
let boardRequestDone = ref(false);

userStore.userService.getUserBoards()
.then( ( response ) => {
	if( !response.data.success ){
		console.error( response.data.message );
		return;
	}
	userBoards.value = response.data.boards;
})
.catch( ( err ) => {
	console.error( err );
})
.finally( () => {
	boardRequestDone.value = true;
});

function boardSelected( id ){
	emit( "boardSelected", id );
}

</script>

<template>
	<div class="d-flex h-100 justify-content-start align-items-start w-100 flex-column">
		<h2>Your Boards</h2>
		<template v-if="!boardRequestDone">
			Loading...
		</template>
		<template v-else-if="userBoards.length === 0">
			<div class="d-flex align-items-center min-card-height-board-list">
				No Boards
			</div>
		</template>
		<template v-else>
			<div class="row">
				<template v-for="board in userBoards" :key="board.name">
					<div class="col-auto">
						<BoardListCard
							:boardName="board.name"
							:isSelected="board._id === props.selectedBoard"
							@boardCardClicked="boardSelected(board._id)"
						/>
					</div>
				</template>
			</div>
		</template>	
	</div>
</template>

<style scoped>
.min-card-height-board-list{
	min-height: 9em;
}
</style>
