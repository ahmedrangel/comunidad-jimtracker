<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row, SortDirection, TableMeta } from "@tanstack/vue-table";

const { data } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const { user } = useUserSession();

const accounts = ref(data.value?.toSorted((a, b) => b.eloValue - a.eloValue) || []);
const UButton = resolveComponent("UButton");
const USelect = resolveComponent("USelect");

const setSortIcon = (isSorted?: false | SortDirection) => {
  return isSorted ? isSorted === "asc" ? "lucide:chevron-up" : "lucide:chevron-down" : "lucide:list-chevrons-up-down";
};

const calculateWinRate = (wins?: number | null, losses?: number | null): number => {
  const totalGames = (wins || 0) + (losses || 0);
  return totalGames === 0 ? 0 : ((wins || 0) / totalGames) * 100;
};

const columns: TableColumn<any>[] = [
  {
    accessorKey: "rank",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "#",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
        }
      });
    }
  },
  {
    accessorKey: "account",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Cuenta",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
          const sort = column.getIsSorted();
          if (sort === "asc") {
            accounts.value = data.value?.toSorted((a, b) => a.gameName.localeCompare(b.gameName)) || [];
          }
          else if (sort === "desc") {
            accounts.value = data.value?.toSorted((a, b) => b.gameName.localeCompare(a.gameName)) || [];
          }
          else {
            accounts.value = data.value || [];
          }
        }
      });
    }
  },
  {
    accessorKey: "region",
    header: () => {
      return h(USelect, {
        "modelValue": preferences.value.region,
        "onUpdate:modelValue": (value: string) => {
          preferences.value.region = value;
        },
        "color": "neutral",
        "variant": "subtle",
        "class": "min-w-24",
        "items": [{ label: "Región", value: "ALL" }, ...regionMap]
      });
    }
  },
  {
    accessorKey: "elo",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Elo",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
          const sort = column.getIsSorted();
          if (sort === "asc") {
            accounts.value = data.value?.toSorted((a, b) => a.eloValue - b.eloValue) || [];
          }
          else if (sort === "desc") {
            accounts.value = data.value?.toSorted((a, b) => b.eloValue - a.eloValue) || [];
          }
          else {
            accounts.value = data.value || [];
          }
        }
      });
    }
  },
  {
    accessorKey: "wins-losses",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "V - D",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
          const sort = column.getIsSorted();
          if (sort === "asc") {
            accounts.value = data.value?.toSorted((a, b) => (b.losses || 0) - (a.losses || 0))?.toSorted((a, b) => (a.wins || 0) - (b.wins || 0)) || [];
          }
          else if (sort === "desc") {
            accounts.value = data.value?.toSorted((a, b) => (a.losses || 0) - (b.losses || 0))?.toSorted((a, b) => (b.wins || 0) - (a.wins || 0)) || [];
          }
          else {
            accounts.value = data.value || [];
          }
        }
      });
    }
  },
  {
    accessorKey: "matches",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Partidas",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
          const sort = column.getIsSorted();
          if (sort === "asc") {
            accounts.value = data.value?.toSorted((a, b) => (a.wins || 0) + (a.losses || 0) - ((b.wins || 0) + (b.losses || 0))) || [];
          }
          else if (sort === "desc") {
            accounts.value = data.value?.toSorted((a, b) => (b.wins || 0) + (b.losses || 0) - ((a.wins || 0) + (a.losses || 0))) || [];
          }
          else {
            accounts.value = data.value || [];
          }
        }
      });
    }
  },
  {
    accessorKey: "winRate",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Winrate",
        icon: setSortIcon(isSorted),
        onClick: () => {
          column.toggleSorting();
          const sort = column.getIsSorted();
          if (sort === "asc") {
            accounts.value = data.value?.toSorted((a, b) => calculateWinRate(a.wins, a.losses) - calculateWinRate(b.wins, b.losses)) || [];
          }
          else if (sort === "desc") {
            accounts.value = data.value?.toSorted((a, b) => calculateWinRate(b.wins, b.losses) - calculateWinRate(a.wins, a.losses)) || [];
          }
          else {
            accounts.value = data.value || [];
          }
        }
      });
    }
  }
];

const meta: TableMeta<any> = {
  class: {
    tr: (row: Row<any>) => {
      if (row.original.user.twitchId === user.value?.twitchId) {
        return "bg-green-300/6";
      }
      if (row.original.user.twitchId === SITE.twitchId) {
        return "bg-white/7";
      }
      return "";
    }
  }
};

const preferences = ref({
  hideUnrankeds: false,
  region: "ALL"
});

const searchTerm = ref("");

watch(preferences, () => {
  localStorage.setItem("pref-hide-unrankeds", String(preferences.value.hideUnrankeds));

  if (preferences.value.region) {
    localStorage.setItem("pref-region", preferences.value.region);
  }
}, { deep: true });

const noSpaced = (str?: string | null) => str?.replace(/\s+/g, "")?.toLowerCase() || "";

const computedAccounts = computed(() => {
  return accounts.value.filter((account) => {
    if (preferences.value.hideUnrankeds && !account.tier) {
      return false;
    }
    if (preferences.value.region !== "ALL" && account.region !== preferences.value.region) {
      return false;
    }
    if (searchTerm.value) {
      const search = noSpaced(searchTerm.value);
      const gameNameMatch = noSpaced(account.gameName).includes(search);
      const tagLineMatch = noSpaced(account.tagLine).includes(search);
      const nameTagMatch = noSpaced(`${account.gameName}#${account.tagLine}`).includes(search);
      const twitchDisplayMatch = noSpaced(account.user?.twitchDisplay).includes(search);
      const twitchLoginMatch = noSpaced(account.user?.twitchLogin).includes(search);
      return gameNameMatch || tagLineMatch || nameTagMatch || twitchDisplayMatch || twitchLoginMatch;
    }
    return true;
  });
});

const tableTooltip = ref<{
  reference: HTMLElement | undefined;
  hovered: boolean;
  value?: string;
}>({
  reference: undefined,
  hovered: false,
  value: undefined
});

const onFlagHover = (event: PointerEvent, text?: string) => {
  tableTooltip.value.reference = event.currentTarget as HTMLElement;
  tableTooltip.value.value = text;
  tableTooltip.value.hovered = true;
};

onMounted(() => {
  const hideUnrankeds = localStorage.getItem("pref-hide-unrankeds");
  preferences.value.hideUnrankeds = hideUnrankeds === "true";
  const region = localStorage.getItem("pref-region");
  if (region) {
    preferences.value.region = region;
  }
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="max-w-300 w-full">
      <div class="flex justify-between items-center gap-2">
        <UInput v-model="searchTerm" placeholder="Escribe para filtrar..." class="mb-4" trailing-icon="lucide:search" />
        <UCheckbox v-model="preferences.hideUnrankeds" label="Ocultar unrankeds" class="mb-4" />
      </div>
      <div class="rounded-sm shadow bg-elevated/50">
        <UTable :data="computedAccounts" :columns="columns" :meta="meta" class="flex-1" :ui="{ td: 'p-2 text-highlighted text-base', th: 'text-center' }">
          <template #rank-cell="{ row }">
            <div class="flex items-center justify-center font-semibold">
              {{ row.original.rank }}
            </div>
          </template>
          <template #account-cell="{ row }">
            <div class="flex flex-col items-start gap-0.5">
              <div class="flex items-center gap-1">
                <Icon name="simple-icons:riotgames" class="w-5 h-5 text-red-500" />
                <div class="flex items-center gap-2">
                  <NuxtLink :to="`https://op.gg/es/lol/summoners/${getRegionLabel(row.original.region)}/${row.original.gameName}-${row.original.tagLine}`" target="_blank" class="font-semibold hover:underline">{{ row.original.gameName }} <span class="font-normal text-muted">#{{ row.original.tagLine }}</span></NuxtLink>
                  <Twemoji v-if="row.original.user.country" class="max-w-fit" :emoji="row.original.user.country" png size="1.5em" @pointerenter="onFlagHover($event, getCountryName(row.original.user.country))" @pointerleave="tableTooltip.hovered = false" />
                  <Icon v-if="row.original.user.bio" name="lucide:message-square-more" size="1.3em" @pointerenter="onFlagHover($event, row.original.user.bio)" @pointerleave="tableTooltip.hovered = false" />
                </div>
              </div>
              <div class="flex items-center gap-1">
                <img v-if="row.original.user.twitchProfileImage" :src="row.original.user.twitchProfileImage" class="w-5 h-5 rounded-sm" :alt="row.original.user.twitchDisplay">
                <NuxtLink :to="`/u/${row.original.user.twitchLogin}`" class="hover:underline">
                  <span class="text-xs text-muted font-semibold">{{ row.original.user.twitchDisplay }}</span>
                </NuxtLink>
              </div>
            </div>
          </template>
          <template #region-cell="{ row }">
            <div class="flex items-center justify-center">
              <UBadge :label="getRegionLabel(row.original.region)" size="lg" variant="outline" :ui="{ base: 'bg-default ring-0' }" :style="{ color: getRegionColor(row.original.region), border: `1px solid ${getRegionColor(row.original.region)}` }" />
            </div>
          </template>
          <template #elo-cell="{ row }">
            <div class="flex items-center justify-center gap-1">
              <img :src="`/images/lol/${row.original.tier?.toLowerCase() || 'unranked'}.png`" class="w-10 h-10 md:w-10 md:h-10 max-w-fit" :title="row.original.tier">
              <span v-if="row.original.division || row.original.lp"><span v-if="!['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(row.original.tier)">{{ row.original.division }} · </span>{{ row.original.lp }} LP</span>
            </div>
          </template>
          <template #wins-losses-cell="{ row }">
            <div class="flex flex-col items-center justify-center gap-1 min-w-24">
              <span class="font-semibold"><span class="text-blue-400">{{ row.original.wins }}</span> V <span class="text-dimmed">|</span> <span class="text-rose-400">{{ row.original.losses }}</span> D</span>
              <UProgress v-model="row.original.wins" :max="row.original.wins + row.original.losses" size="lg" class="max-w-26 w-full" :ui="{ base: 'bg-rose-400', indicator: 'bg-blue-400 rounded-none' }" />
            </div>
          </template>
          <template #matches-cell="{ row }">
            <div v-if="row.original.wins || row.original.losses" class="flex items-center justify-center">
              {{ (row.original.wins || 0) + (row.original.losses || 0) }}
            </div>
          </template>
          <template #winRate-cell="{ row }">
            <div class="flex items-center justify-center">
              {{
                row.original.wins && row.original.losses
                  ? ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2) + '%'
                  : ''
              }}
            </div>
          </template>
        </UTable>
        <UPopover
          :content="{ side: 'top', updatePositionStrategy: 'always', sideOffset: 0 }"
          :open="tableTooltip.hovered"
          :reference="tableTooltip.reference"
          arrow
          :ui="{ arrow: 'fill-current', content: 'py-2 px-3 whitespace-pre' }"
        >
          <template #content>
            {{ tableTooltip.value }}
          </template>
        </UPopover>
      </div>
    </div>
  </main>
</template>
