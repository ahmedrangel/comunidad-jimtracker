<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row, SortDirection, TableMeta } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { refDebounced } from "@vueuse/core";

const props = defineProps<{
  data: JimTableData[];
  chatters: string[];
}>();

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

const columns: TableColumn<JimTableData>[] = [
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
    cell: ({ row }) => h(TableCellRank, { data: row.original })
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
    cell: ({ row }) => h(TableCellAccounts, { data: row.original, chatters: props.chatters }),
    filterFn: (row, columnId, search) => {
      if (!search) return true;

      const gameNameMatch = noSpaced(row.original.gameName).includes(search);
      const tagLineMatch = noSpaced(row.original.tagLine).includes(search);
      const nameTagMatch = noSpaced(`${row.original.gameName}#${row.original.tagLine}`).includes(search);
      const twitchDisplayMatch = noSpaced(row.original.user?.twitchDisplay).includes(search);
      const twitchLoginMatch = noSpaced(row.original.user?.twitchLogin).includes(search);
      const countryMatch = noSpaced(row.original.user?.country).includes(search);

      return gameNameMatch || tagLineMatch || nameTagMatch || twitchDisplayMatch || twitchLoginMatch || countryMatch;
    }
  },
  {
    accessorKey: "region",
    header: (data) => {
      const tableData = data.table.options.data as JimTableData[];
      const regionSet = new Set<string>();
      for (const item of tableData) {
        regionSet.add(item.region);
      }
      const uniqueRegionMap = Array.from(regionSet).map(region => ({
        label: getRegionLabel(region),
        value: region
      }));
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
        "items": [{ label: "Región", value: "ALL" }, ...uniqueRegionMap]
      });
    },
    cell: ({ row }) => h(TableCellRegion, { data: row.original }),
    filterFn: "equals"
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => h(TableCellRoles, { data: row.original })
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
    cell: ({ row }) => h(TableCellElo, { data: row.original }),
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === true) {
        return row.original.eloValue > 0;
      }
      return true;
    }
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
    cell: ({ row }) => h(TableCellWinRate, { data: row.original })
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
    cell: ({ row }) => h(TableCellWinLosses, { data: row.original }),
    sortingFn: ({ original: rowA }, { original: rowB }) => {
      const aWins = rowA.wins || 0;
      const aLosses = rowA.losses || 0;
      const bWins = rowB.wins || 0;
      const bLosses = rowB.losses || 0;

      return aWins !== bWins ? aWins - bWins : bLosses - aLosses;
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
  region: "ALL",
  country: "ALL"
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

watch(() => preferences.value.country, (newValue) => {
  const countryColumn = table.value?.tableApi?.getColumn("account");
  if (countryColumn) {
    if (newValue === "ALL") {
      countryColumn.setFilterValue(undefined);
    }
    else {
      countryColumn.setFilterValue(newValue);
    }
  }
  table.value?.tableApi?.setPageIndex(0);
});

watch(debouncedSearch, (value) => {
  table.value?.tableApi?.getColumn("account")?.setFilterValue(noSpaced(value));
});

onMounted(() => {
  const hideUnrankeds = localStorage.getItem("pref-hide-unrankeds");
  preferences.value.hideUnrankeds = hideUnrankeds === "true";

  nextTick(() => {
    if (preferences.value.hideUnrankeds) {
      table.value?.tableApi?.getColumn("elo")?.setFilterValue(true);
    }
  });
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 100
});

const setPage = (page: number) => {
  table.value?.tableApi?.setPageIndex(page - 1);
  window.scrollTo({ top: 0, behavior: "instant" });
};

const tablePopover = useTablePopover();

const countriesSet = new Set<string>();
for (const item of props.data) {
  if (item.user.country) {
    countriesSet.add(item.user.country);
  }
}
</script>

<template>
  <div class="w-full mx-auto">
    <div class="flex justify-start items-center gap-2 pb-3.5 flex-wrap">
      <UInput
        v-model="searchInput"
        placeholder="Escribe para filtrar..."
        class="min-w-[12ch]"
        trailing-icon="lucide:search"
        type="search"
      />
      <USelect
        v-model="preferences.country"
        class="min-w-[30ch]"
        :items="[
          { label: 'País', value: 'ALL' },
          ...Array.from(countriesSet).sort(
            (a, b) => getCountryName(a)!.localeCompare(getCountryName(b)!),
          ).map(country => ({ label: getCountryName(country), value: country })),
        ]"
      >
        <template #leading="{ modelValue }">
          <Twemoji
            v-if="modelValue !== 'ALL'"
            :emoji="modelValue"
            :alt="getCountryName(modelValue)"
            size="1.5em"
          />
          <Icon v-else name="lucide:globe" size="1.5em" mode="css" />
        </template>
        <template #item="{ item }">
          <div class="flex items-center gap-2 min-w-[12ch] shrink-0">
            <Twemoji
              v-if="item.value !== 'ALL'"
              :emoji="item.value"
              :alt="getCountryName(item.value)"
              size="1.5em"
            />
            <Icon v-else name="lucide:globe" size="1.5em" mode="css" />
            <span>{{ item.label }}</span>
          </div>
        </template>
      </USelect>
      <UCheckbox v-model="preferences.hideUnrankeds" label="Ocultar unrankeds" />
    </div>
    <div class="rounded-sm shadow bg-elevated/50 border border-accented">
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
          @update:page="setPage"
        />
      </div>
    </div>
  </div>
  <UPopover
    :content="{ side: 'top', updatePositionStrategy: 'always', sideOffset: 0 }"
    :open="tablePopover.options.open"
    :reference="tablePopover.options.reference"
    arrow
    :ui="{ arrow: 'fill-current', content: 'py-2 px-3 whitespace-pre-wrap' }"
  >
    <template #content>
      {{ tablePopover.options.value }}
    </template>
  </UPopover>
</template>
