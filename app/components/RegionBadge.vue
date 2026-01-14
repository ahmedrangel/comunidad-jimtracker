<script setup lang="ts">
defineProps<{
  region: string;
  size?: "sm" | "md" | "lg" | "xs" | "xl";
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    <UBadge :label="getRegionLabel(region)" :size="size" variant="outline" :ui="{ base: 'bg-default ring-0' }" :style="{ color: getRegionColor(region), border: `1px solid ${getRegionColor(region)}` }" />
  </div>
</template>
