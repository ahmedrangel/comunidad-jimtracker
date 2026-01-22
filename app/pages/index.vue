<script setup lang="ts">
const { data } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => [] as JimTableData[]
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="max-w-7xl w-full">
      <TableData :data="data" />
      <USeparator class="my-8" />
      <LazyDataDistribution :data="data" hydrate-on-visible />
    </div>
  </main>
</template>
