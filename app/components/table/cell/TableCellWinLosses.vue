<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-1 min-w-24">
    <span class="font-semibold"><span class="text-blue-400">{{ row.original.wins }}</span> V <span class="text-dimmed">|</span> <span class="text-rose-400">{{ row.original.losses }}</span> D</span>
    <UProgress :model-value="row.original.wins" :max="row.original.wins + row.original.losses" size="lg" class="max-w-26 w-full" :ui="{ base: 'bg-rose-400', indicator: 'bg-blue-400 rounded-none' }" />
  </div>
</template>
