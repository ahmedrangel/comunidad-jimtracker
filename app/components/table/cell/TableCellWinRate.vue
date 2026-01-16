<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    {{
      row.original.wins || row.original.losses
        ? ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2) + '%'
        : ''
    }}
  </div>
</template>
