<script setup lang="ts">
defineProps<{
  row: any;
}>();
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <img
      :src="`/images/lol/${row.original.tier?.toLowerCase() || 'unranked'}.png`"
      class="w-10 h-10 md:w-10 md:h-10 max-w-fit"
      :alt="row.original.tier || 'UNRANKED'"
      :title="row.original.tier || 'UNRANKED'"
    >
    <span v-if="row.original.division || row.original.lp"><span v-if="!['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(row.original.tier)">{{ row.original.division }} · </span>{{ row.original.lp }} LP</span>
  </div>
</template>
