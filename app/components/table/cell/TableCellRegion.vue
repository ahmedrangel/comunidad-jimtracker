<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <RegionBadge :region="row.original.region" size="lg" />
</template>
