<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const columns: TableColumn<any>[] = [
  {
    accessorKey: "rank",
    header: "#"
  },
  {
    accessorKey: "user",
    header: "Usuario"
  },
  {
    accessorKey: "region",
    header: "Región"
  },
  {
    accessorKey: "elo",
    header: "Elo"
  },
  {
    accessorKey: "wins",
    header: "Victorias"
  },
  {
    accessorKey: "losses",
    header: "Derrotas"
  },
  {
    accessorKey: "winRate",
    header: "Winrate"
  }
];

const { data } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const accounts = data.value?.sort((a, b) => b.eloValue - a.eloValue) || [];
</script>

<template>
  <main>
    <UTable :data="accounts" :columns="columns" class="flex-1" :ui="{ td: 'p-2 text-highlighted text-base' }">
      <template #user-cell="{ row }">
        <div class="flex flex-col items-start gap-0.5">
          <div class="flex items-center gap-1">
            <Icon name="simple-icons:riotgames" class="w-5 h-5 text-red-500" />
            <div class="flex items-center gap-2">
              <NuxtLink :to="`https://op.gg/es/lol/summoners/${getRegionLabel(row.original.region)}/${row.original.gameName}-${row.original.tagLine}`" target="_blank" external class="font-semibold hover:underline">{{ row.original.gameName }} #{{ row.original.tagLine }}</NuxtLink>
              <Twemoji v-if="row.original.user.country" class="max-w-fit" :emoji="row.original.user.country" png size="1.5em" />
            </div>
          </div>
          <div class="flex items-center gap-1">
            <img v-if="row.original.user.twitchProfileImage" :src="row.original.user.twitchProfileImage" class="w-5 h-5 rounded-sm" :alt="row.original.user.twitchDisplay">
            <NuxtLink :to="`/u/${row.original.user.twitchLogin}`" class="hover:underline">
              <span class="text-xs text-neutral-400 font-semibold">{{ row.original.user.twitchDisplay }}</span>
            </NuxtLink>
          </div>
        </div>
      </template>
      <template #region-cell="{ row }">
        <UBadge :label="getRegionLabel(row.original.region)" size="lg" variant="outline" color="neutral" />
      </template>
      <template #elo-cell="{ row }">
        <div class="flex items-center gap-1">
          <img :src="`/images/lol/${row.original.tier?.toLowerCase() || 'unranked'}.png`" class="w-10 h-10 md:w-10 md:h-10 max-w-fit" :title="row.original.tier">
          <span v-if="row.original.division || row.original.lp">{{ row.original.division }} · {{ row.original.lp }} LP</span>
        </div>
      </template>
      <template #winRate-cell="{ row }">
        <span>
          {{
            row.original.wins && row.original.losses
              ? ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2) + '%'
              : ''
          }}
        </span>
      </template>
    </UTable>
  </main>
</template>
