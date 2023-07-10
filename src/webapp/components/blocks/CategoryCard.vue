<script setup>

const props = defineProps({
  category: Object,
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["categoryCardClicked"]);

function categoryCardClicked(_event) {
  emit("categoryCardClicked");
}

</script>

<template>
	<div class="card bg-primary border-1 border-pink-accent-primary-hover category-card m-3 pointer" :class="[ { 'border-pink-accent-primary' : isSelected } ]" @click="categoryCardClicked">
		<div class="card-header" :class="[{ 'bg-pink-accent-primary': isSelected }, { 'text-dark': isSelected }]">
				<h5 class="mb-0 text-truncate">{{ category.categoryName }}</h5>
		</div>
		<div class="card-body">
			<div class="d-flex flex-column align-items-center justify-content-center h-100">
				<h5>
					Edit Category
				</h5>
			</div>
		</div>
	</div>
</template>

<style scoped>
.category-card {
  width: 12em;
  height: 9em;
  max-width: 90vw;
}
</style>
