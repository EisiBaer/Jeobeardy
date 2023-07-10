<script setup>

const props = defineProps({
  categoryName: String,
  categoryDescription: String,
});

</script>

<template>
  <div class="card bg-pink-accent-primary mb-1 flex-fill category-header-card" :title="props.categoryDescription">
    <div class="card-body text-center">
      <div class="d-flex justify-content-center align-items-center h-100">
        <h4 class="mb-0 user-select-none">
          {{ props.categoryName }}
        </h4>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-header-card{
  max-height: 20%;
  max-width: 90vw;
}
</style>