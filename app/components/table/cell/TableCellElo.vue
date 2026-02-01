<script setup lang="ts">
defineProps<{
  data: JimTableData;
}>();

const tablePopover = useTablePopover();
</script>

<template>
  <div class="flex items-center justify-center gap-1 min-w-32">
    <img
      :src="`/images/lol/${data.tier?.toLowerCase() || 'unranked'}.png`"
      class="w-10 h-10 md:w-10 md:h-10 max-w-fit"
      :alt="data.tier || 'UNRANKED'"
      v-on="tablePopover.handlers(data.tier || 'UNRANKED')"
    >
    <span v-if="data.tier && (data.division || data.lp)"><span v-if="!['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(data.tier)">{{ data.division }} · </span>{{ data.lp }} LP</span>
  </div>
</template>
