<script setup lang="ts">
defineProps<{
  data: JimTableData;
}>();
</script>

<template>
  <div class="min-w-32 mx-5">
    <div class="flex w-full items-center justify-center gap-1 font-semibold">
      <span class="text-blue-400">{{ data.wins || 0 }}</span>
      <UProgress
        :model-value="data.wins"
        :max="(data.wins || 0) + (data.losses || 0)"
        size="lg"
        class="max-w-26 w-full"
        :ui="{ base: 'bg-rose-400', indicator: 'bg-blue-400 rounded-none' }"
      />
      <span class="text-rose-400">{{ data.losses || 0 }}</span>
    </div>
  </div>
</template>
