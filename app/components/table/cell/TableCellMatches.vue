<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div v-if="row.original.wins || row.original.losses" class="flex items-center justify-center">
    {{ (row.original.wins || 0) + (row.original.losses || 0) }}
  </div>
</template>
