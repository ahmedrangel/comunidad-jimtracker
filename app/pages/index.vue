<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row, SortDirection, TableMeta } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { refDebounced } from "@vueuse/core";

const { data } = await useFetch("/api/riot-accounts", {
  key: "riot-accounts",
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
});

const { user } = useUserSession();

const UButton = resolveComponent("UButton");
const USelect = resolveComponent("USelect");

const TableCellRank = resolveComponent("TableCellRank");
const TableCellAccounts = resolveComponent("TableCellAccounts");
const TableCellRegion = resolveComponent("TableCellRegion");
const TableCellElo = resolveComponent("TableCellElo");
const TableCellRoles = resolveComponent("TableCellRoles");
const TableCellWinLosses = resolveComponent("TableCellWinLosses");
const TableCellWinRate = resolveComponent("TableCellWinRate");
const TableCellMatches = resolveComponent("TableCellMatches");

const setSortIcon = (isSorted?: false | SortDirection) => {
  return isSorted ? isSorted === "asc" ? "lucide:chevron-up" : "lucide:chevron-down" : "lucide:list-chevrons-up-down";
};

const calculateWinRate = (wins?: number | null, losses?: number | null): number => {
  const totalGames = (wins || 0) + (losses || 0);
  return totalGames === 0 ? 0 : ((wins || 0) / totalGames) * 100;
};

const noSpaced = (str?: string | null) => str?.replace(/\s+/g, "")?.toLowerCase() || "";

const table = useTemplateRef("table");

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, 300);

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
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellRank, { row })
  },
  {
    id: "account",
    accessorKey: "gameName",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Cuenta",
        icon: setSortIcon(isSorted),
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellAccounts, { row }),
    filterFn: (row, columnId, search) => {
      if (!search) return true;

      const gameNameMatch = noSpaced(row.original.gameName).includes(search);
      const tagLineMatch = noSpaced(row.original.tagLine).includes(search);
      const nameTagMatch = noSpaced(`${row.original.gameName}#${row.original.tagLine}`).includes(search);
      const twitchDisplayMatch = noSpaced(row.original.user?.twitchDisplay).includes(search);
      const twitchLoginMatch = noSpaced(row.original.user?.twitchLogin).includes(search);

      return gameNameMatch || tagLineMatch || nameTagMatch || twitchDisplayMatch || twitchLoginMatch;
    }
  },
  {
    accessorKey: "region",
    header: () => {
      return h(USelect, {
        "modelValue": preferences.value.region,
        "onUpdate:modelValue": (value: string) => {
          preferences.value.region = value;
          const column = table.value?.tableApi?.getColumn("region");
          if (value === "ALL") {
            column?.setFilterValue(undefined);
          }
          else {
            column?.setFilterValue(value);
          }
        },
        "color": "neutral",
        "variant": "subtle",
        "class": "min-w-24",
        "items": [{ label: "Región", value: "ALL" }, ...regionMap]
      });
    },
    cell: ({ row }) => h(TableCellRegion, { row }),
    filterFn: "equals"
  },
  {
    id: "elo",
    accessorKey: "eloValue",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Elo",
        icon: setSortIcon(isSorted),
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellElo, { row }),
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === true) {
        return row.original.eloValue > 0;
      }
      return true;
    }
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => h(TableCellRoles, { row })
  },
  {
    id: "wins-losses",
    accessorFn: row => (row.wins || 0) - (row.losses || 0),
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "V - D",
        icon: setSortIcon(isSorted),
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellWinLosses, { row })
  },
  {
    id: "matches",
    accessorFn: row => (row.wins || 0) + (row.losses || 0),
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Partidas",
        icon: setSortIcon(isSorted),
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellMatches, { row })
  },
  {
    id: "winRate",
    accessorFn: row => calculateWinRate(row.wins, row.losses),
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Winrate",
        icon: setSortIcon(isSorted),
        onClick: () => column.toggleSorting()
      });
    },
    cell: ({ row }) => h(TableCellWinRate, { row })
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

watch(() => preferences.value.hideUnrankeds, (newValue) => {
  localStorage.setItem("pref-hide-unrankeds", String(newValue));
  const eloColumn = table.value?.tableApi?.getColumn("elo");
  if (eloColumn) {
    eloColumn.setFilterValue(newValue ? true : undefined);
  }
  // reset to first page when toggling
  table.value?.tableApi?.setPageIndex(0);
});

watch(() => preferences.value.region, () => {
  localStorage.setItem("pref-region", preferences.value.region);
});

watch(debouncedSearch, (value) => {
  table.value?.tableApi?.getColumn("account")?.setFilterValue(noSpaced(value));
});

onMounted(() => {
  const hideUnrankeds = localStorage.getItem("pref-hide-unrankeds");
  preferences.value.hideUnrankeds = hideUnrankeds === "true";

  const region = localStorage.getItem("pref-region");
  if (region && region !== "ALL") {
    preferences.value.region = region;
  }

  nextTick(() => {
    if (preferences.value.hideUnrankeds) {
      table.value?.tableApi?.getColumn("elo")?.setFilterValue(true);
    }
    if (preferences.value.region && preferences.value.region !== "ALL") {
      table.value?.tableApi?.getColumn("region")?.setFilterValue(preferences.value.region);
    }
  });
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 100
});
</script>

<template>
  <main class="flex justify-center items-center">
    <div class="max-w-300 w-full">
      <div class="flex justify-between items-center gap-2 px-4 py-3.5">
        <UInput
          v-model="searchInput"
          placeholder="Escribe para filtrar..."
          class="min-w-[12ch]"
          trailing-icon="lucide:search"
          type="search"
        />
        <UCheckbox v-model="preferences.hideUnrankeds" label="Ocultar unrankeds" />
      </div>
      <div class="rounded-sm shadow bg-elevated/50">
        <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="data"
          :columns="columns"
          :meta="meta"
          :get-row-id="(row) => row.puuid"
          class="flex-1"
          :ui="{ td: 'p-2 text-highlighted text-base', th: 'text-center' }"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
        />

        <div class="flex flex-col lg:flex-row justify-between items-center px-4 py-3.5 border-t border-default gap-2">
          <div class="text-sm text-muted">
            Mostrando {{ Math.min((table?.tableApi?.getState().pagination.pageIndex || 0) * pagination.pageSize + 1, table?.tableApi?.getFilteredRowModel().rows.length || 0) }} - {{ Math.min(((table?.tableApi?.getState().pagination.pageIndex || 0) + 1) * pagination.pageSize, table?.tableApi?.getFilteredRowModel().rows.length || 0) }} de {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
          </div>
          <UPagination
            v-if="table?.tableApi && table?.tableApi?.getFilteredRowModel().rows.length > pagination.pageSize"
            :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length || 0"
            :sibling-count="1"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </div>
  </main>
</template>
