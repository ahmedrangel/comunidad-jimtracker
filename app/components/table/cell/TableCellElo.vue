<script setup lang="ts">
defineProps<{
  data: JimTableData;
}>();

const tablePopover = useTablePopover();
</script>

<template>
  <div class="flex items-center justify-center gap-1 min-w-32">
    <img
      :src="getTierImage(data.tier)"
      class="w-10 h-10 md:w-10 md:h-10 max-w-fit"
      :alt="getTierLabel(data.tier)"
      v-on="tablePopover.handlers(getTierLabel(data.tier))"
    >
    <span v-if="data.tier && (data.division || data.lp)"><span v-if="!isApexTier(data.tier)">{{ data.division }} · </span>{{ data.lp }} LP</span>
  </div>
</template>
