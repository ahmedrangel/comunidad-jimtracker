<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div class="flex items-center justify-center font-semibold">
    {{ row.original.rank }}
  </div>
</template>
