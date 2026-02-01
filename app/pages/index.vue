<script setup lang="ts">
const { data } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => [] as JimTableData[]
});

const { data: chatters } = await useLazyFetch("/api/chatters", {
  key: "chatters",
  server: false,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  default: () => [] as string[]
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="max-w-7xl w-full">
      <TableData :data="data" :chatters="chatters" />
      <USeparator class="my-8" />
      <LazyDataDistribution :data="data" hydrate-on-visible />
    </div>
  </main>
</template>
