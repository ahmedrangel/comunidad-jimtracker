<script setup lang="ts">
defineProps<{
  data: JimTableData;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-1 min-w-24">
    <span class="font-semibold">
      <span class="text-blue-400">{{ data.wins || 0 }}</span> V <span class="text-dimmed">|</span> <span class="text-rose-400">{{ data.losses || 0 }}</span> D
    </span>
    <UProgress
      :model-value="data.wins"
      :max="(data.wins || 0) + (data.losses || 0)"
      size="lg"
      class="max-w-26 w-full"
      :ui="{ base: 'bg-rose-400', indicator: 'bg-blue-400 rounded-none' }"
    />
  </div>
</template>
