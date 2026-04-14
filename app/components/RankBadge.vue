<script setup lang="ts">
const props = defineProps<{
  rank: number;
}>();

const isTop = computed(() => props.rank > 0 && props.rank <= 20);
</script>

<template>
  <div class="rank-badge relative before:absolute rounded overflow-hidden border flex items-center justify-start" :class="[isTop ? 'dark:bg-yellow-400 dark:before:bg-yellow-950 bg-yellow-700 before:bg-yellow-100 border-yellow-700 dark:border-yellow-400' : 'dark:bg-white dark:before:bg-black/80 bg-black/70 before:bg-white border-black/70 dark:border-white']" :title="`Rank #${rank}`">
    <span class="relative text-lg font-semibold ps-2 pe-4" :class="[isTop ? 'dark:text-yellow-400 text-yellow-700' : 'text-normal']">#{{ rank }}</span>
  </div>
</template>

<style scoped>
.rank-badge::before {
  content: '';
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}

.rank-badge, .rank-badge::before {
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%);
}
</style>
