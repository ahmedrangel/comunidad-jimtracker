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
    accessorKey: "server",
    header: "Servidor"
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

const data = [
  {
    rank: 1,
    twitchLogin: "ahmed_r",
    twitchDisplay: "Ahmed_R",
    country: "🇵🇦",
    gameName: "Hyundai",
    tagLine: "KONA",
    server: "NA",
    tier: "Diamond",
    division: "IV",
    lp: 50,
    wins: 100,
    losses: 80
  },
  {
    rank: 2,
    twitchLogin: "yizack",
    twitchDisplay: "Yizack",
    country: "🇲🇽",
    gameName: "Nuxt",
    tagLine: "vue",
    server: "NA",
    tier: "Gold",
    division: "IV",
    lp: 50,
    wins: 100,
    losses: 80
  }
];
</script>

<template>
  <main>
    <UTable :data="data" :columns="columns" class="flex-1" :ui="{ td: 'p-2 text-highlighted text-base' }">
      <template #user-cell="{ row }">
        <div class="flex flex-col items-start gap-0.5">
          <div class="flex items-center gap-1">
            <Icon name="simple-icons:riotgames" class="w-4 h-4 text-red-500" />
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ row.original.gameName }} #{{ row.original.tagLine }}</span>
              <Twemoji v-if="row.original.country" :emoji="row.original.country" png size="1.5em" />
            </div>
          </div>
          <div class="flex items-center gap-1">
            <Icon name="simple-icons:twitch" class="w-4 h-4 text-violet-500" />
            <NuxtLink :to="`https://twitch.tv/${row.original.twitchLogin}`" target="_blank" class="hover:underline">
              <span class="text-xs text-neutral-400">{{ row.original.twitchDisplay }}</span>
            </NuxtLink>
          </div>
        </div>
      </template>
      <template #server-cell="{ row }">
        <UBadge :label="row.original.server" size="lg" variant="outline" color="neutral" />
      </template>
      <template #elo-cell="{ row }">
        <div class="flex items-center gap-1">
          <img :src="`/images/lol/${row.original.tier?.toLowerCase() || 'unranked'}.png`" class="w-10 h-10 md:w-10 md:h-10 max-w-fit" :title="row.original.tier">
          <span>{{ row.original.division }} · {{ row.original.lp }} LP</span>
        </div>
      </template>
      <template #winRate-cell="{ row }">
        <span>
          {{
            row.original.wins && row.original.losses
              ? ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2) + '%'
              : '0%'
          }}
        </span>
      </template>
    </UTable>
  </main>
</template>
