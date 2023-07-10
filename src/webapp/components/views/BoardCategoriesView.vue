<script setup>

import CategoryCard from '@/components/blocks/CategoryCard.vue';

const props = defineProps({
  categories: Array,
  selectedCategoryIndex: Number,
  isSelected: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(["categorySelected"]);

function changeSelectedCategory( boardEntryIndex ) {
  emit("categorySelected", boardEntryIndex );
}

</script>

<template>
  <template v-if="props.selectedCategoryIndex === -1">
    <template v-for="( categoryEntry, categoryEntryIndex ) in props.categories" :key="categoryEntry.categoryName">
      <CategoryCard
      :category="categoryEntry"
      :isSelected="props.isSelected"
      @categoryCardClicked=" () => changeSelectedCategory( categoryEntryIndex )"
      />
    </template>
  </template>
  <template v-else>
    <CategoryCard
    :category="props.categories[selectedCategoryIndex]"
    :isSelected="props.isSelected"
    @categoryCardClicked=" () => changeSelectedCategory( props.selectedCategoryIndex )"
    />
  </template>
</template>

<style scoped></style>
