<script setup lang="ts">
defineProps<{
  data: JimTableData;
}>();
</script>

<template>
  <div class="flex items-center justify-center">
    <div v-if="data.wins || data.losses" class="flex flex-col justify-center">
      <div>
        {{ (((data.wins || 0) / ((data.wins || 0) + (data.losses || 0))) * 100).toFixed(2) + '%' }}
      </div>
      <div class="text-muted text-sm">{{ (data.wins || 0) + (data.losses || 0) }} partidas</div>
    </div>
  </div>
</template>
