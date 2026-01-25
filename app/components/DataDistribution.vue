<script setup lang="ts">
const props = defineProps<{
  data: JimTableData[];
}>();

const countryStats = computed(() => {
  const stats = new Map<string, number>();

  props.data.forEach((item) => {
    const country = item.user.country || "🏳️";
    stats.set(country, (stats.get(country) || 0) + 1);
  });

  return Array.from(stats.entries())
    .map(([country, count]) => ({ country, count, name: getCountryName(country) || "Sin país" }))
    .sort((a, b) => b.count - a.count);
});

const regionStats = computed(() => {
  const stats = new Map<string, number>();

  props.data.forEach((item) => {
    const region = item.region;
    stats.set(region, (stats.get(region) || 0) + 1);
  });

  return Array.from(stats.entries())
    .map(([region, count]) => ({
      region,
      count
    }))
    .sort((a, b) => b.count - a.count);
});

const tierStats = computed(() => {
  const stats = new Map<string, { count: number, maxElo: number }>();

  props.data.forEach((item) => {
    const tier = item.tier || "UNRANKED";
    const current = stats.get(tier) || { count: 0, maxElo: 0 };
    stats.set(tier, {
      count: current.count + 1,
      maxElo: Math.max(current.maxElo, item.eloValue || 0)
    });
  });

  return Array.from(stats.entries())
    .map(([tier, data]) => ({
      tier,
      count: data.count,
      maxElo: data.maxElo
    }))
    .sort((a, b) => {
      if (a.tier === "UNRANKED") return 1;
      if (b.tier === "UNRANKED") return -1;
      return b.maxElo - a.maxElo;
    });
});

const roleStats = computed(() => {
  const stats = new Map<string, number>();

  props.data.forEach((item) => {
    if (item.role1) {
      stats.set(item.role1, (stats.get(item.role1) || 0) + 1);
    }
    if (item.role2) {
      stats.set(item.role2, (stats.get(item.role2) || 0) + 1);
    }
  });

  const roleOrder = ["top", "jungle", "mid", "adc", "support", "fill"];

  return Array.from(stats.entries())
    .map(([role, count]) => ({
      role,
      count
    }))
    .sort((a, b) => {
      const indexA = roleOrder.indexOf(a.role);
      const indexB = roleOrder.indexOf(b.role);
      return indexA - indexB;
    });
});

const tablePopover = useTablePopover();

const tabItems = [
  { label: "País", slot: "country" },
  { label: "Región", slot: "region" },
  { label: "Tier", slot: "tier" },
  { label: "Rol", slot: "role" }
];
</script>

<template>
  <div class="space-y-4 rounded-sm shadow bg-elevated/50 border border-accented p-4">
    <h2 class="text-2xl font-bold mb-6">Distribución</h2>
    <p class="text-muted">Cantidad de usuarios y cuentas de la comunidad agrupados por diferentes categorías.</p>
    <UTabs
      :items="tabItems"
      class="w-full"
      :ui="{
        list: 'border border-accented bg-default mb-4 lg:gap-1',
        trigger: 'data-[state=inactive]:text-default hover:data-[state=inactive]:bg-elevated',
      }"
    >
      <template #country>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0">
          <UCard
            v-for="stat in countryStats"
            :key="stat.country"
            :ui="{
              root: 'ring-0 border border-accented hover:bg-primary/5 rounded-none -ml-px -mt-px',
              body: 'px-2 py-3 sm:px-2 sm:py-3',
            }"
            v-on="tablePopover.handlers(getCountryName(stat.country))"
          >
            <div class="flex flex-col items-center text-center gap-1">
              <Twemoji :emoji="stat.country" size="1.5em" png />
              <div>
                <p class="text-lg font-bold">{{ stat.count }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </template>

      <template #region>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-0">
          <UCard
            v-for="stat in regionStats"
            :key="stat.region"
            :ui="{
              root: 'ring-0 border border-accented hover:bg-primary/5 rounded-none -ml-px -mt-px',
              body: 'px-2 py-3 sm:px-2 sm:py-3',
            }"
          >
            <div class="flex flex-col items-center text-center gap-1">
              <RegionBadge :region="stat.region" size="lg" />
              <div>
                <p class="text-lg font-bold">{{ stat.count }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </template>

      <template #tier>
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-0">
          <UCard
            v-for="stat in tierStats"
            :key="stat.tier"
            :ui="{
              root: 'ring-0 border border-accented hover:bg-primary/5 rounded-none -ml-px -mt-px',
              body: 'px-2 py-3 sm:px-2 sm:py-3',
            }"
            v-on="tablePopover.handlers(stat.tier)"
          >
            <div class="flex flex-col items-center text-center gap-1">
              <img
                :src="`/images/lol/${stat.tier?.toLowerCase() || 'unranked'}.png`"
                :alt="stat.tier"
                class="w-12 h-12 object-contain"
              >
              <div>
                <p class="text-lg font-bold">{{ stat.count }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </template>

      <template #role>
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-0">
          <UCard
            v-for="stat in roleStats"
            :key="stat.role"
            :ui="{
              root: 'ring-0 border border-accented hover:bg-primary/5 rounded-none -ml-px -mt-px',
              body: 'px-2 py-3 sm:px-2 sm:py-3',
            }"
            v-on="tablePopover.handlers(stat.role.toUpperCase())"
          >
            <div class="flex flex-col items-center text-center gap-1">
              <Icon
                :name="`lol:${stat.role}`"
                class="w-6.5 h-6.5"
                mode="css"
                :alt="stat.role"
              />
              <div>
                <p class="text-lg font-bold">{{ stat.count }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>
