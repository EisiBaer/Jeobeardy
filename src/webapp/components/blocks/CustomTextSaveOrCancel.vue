<script setup>

const props = defineProps({
  saveText: {
    type: String,
    default: "Save",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
});

</script>

<template>
  <div class="m-3">
    <div class="d-flex justify-content-end align-items-center">
      <button class="btn btn-pink-accent-primary me-3">{{ props.saveText }}</button>
      <button class="btn btn-danger">{{ props.cancelText }}</button>
    </div>
  </div>
</template>

<style scoped>
</style>
