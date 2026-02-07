<script setup lang="ts">
const props = defineProps<{
  name: string;
  accounts: JimRiotAccount[];
}>();

const { data: logs } = await useFetch(`/api/users/${props.name}/riot-accounts/logs`, {
  key: `user:${props.name}:riot-accounts:logs`,
  default: () => [] as JimRiotAccountLog[],
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key],
  deep: true
});

const riotAccountMap = computed(() => {
  const map = new Map<string, JimRiotAccount>();
  props.accounts.forEach((item) => {
    map.set(item.puuid, item);
  });
  return map;
});

const enrichedLogs = computed(() => {
  return logs.value.map(log => ({
    ...log,
    account: riotAccountMap.value.get(log.puuid)
  })).toSorted((a, b) => b.createdAt - a.createdAt);
});

const isRankUp = (logData: JimRiotAccountLogData) => {
  const oldValue = eloToValue(logData.old.tier, logData.old.division, logData.old.lp);
  const newValue = eloToValue(logData.new.tier, logData.new.division, logData.new.lp);
  return newValue > oldValue;
};

const limit = 5;
const page = ref(1);
const hasMore = ref(true);
const isLoading = ref(false);

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  page.value++;

  $fetch(`/api/users/${props.name}/riot-accounts/logs`, {
    query: { page: page.value, limit }
  }).then((newLogs) => {
    if (newLogs.length < limit) {
      hasMore.value = false;
    }

    if (newLogs.length > 0) {
      logs.value.push(...newLogs);
    }
  }).catch(() => {}).finally(() => {
    isLoading.value = false;
  });
};

if (logs.value.length < limit) {
  hasMore.value = false;
}

onUnmounted(() => {
  useCachedData(`user:${props.name}:riot-accounts:logs`, () => logs.value.slice(0, limit));
});
</script>

<template>
  <div v-if="logs.length">
    <h2 class="text-xl font-bold mb-4">Cambios de rango</h2>
    <div class="flex flex-col gap-2">
      <div
        v-for="log of enrichedLogs"
        :key="log.id"
        class="flex flex-col md:flex-row items-center gap-1 justify-between p-3 rounded-md border bg-elevated/50"
        :class="isRankUp(log.data)
          ? 'dark:border-blue-400/50 light:border-blue-500/50 dark:bg-blue-400/5 light:bg-blue-500/5'
          : 'dark:border-rose-400/50 light:border-rose-500/50 dark:bg-rose-400/5 light:bg-rose-500/5'
        "
      >
        <span v-if="log.account" class="flex items-center gap-2">
          <img
            v-if="log.account.profileIcon !== null"
            :src="getIconURL(log.account.profileIcon)"
            class="w-6 h-6 rounded-full border border-default"
            :alt="`Icono de perfil de ${log.account.gameName}`"
          >
          <span>
            <span class="font-semibold">{{ log.account.gameName }}</span>
            <span class="text-muted"> #{{ log.account.tagLine }}</span>
          </span>
        </span>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <UPopover mode="hover" :content="{ side: 'top' }" arrow>
              <UButton variant="link" class="p-0">
                <img
                  :src="getTierImage(log.data.old.tier)"
                  class="w-8 h-8"
                  :alt="getTierLabel(log.data.old.tier)"
                >
              </UButton>
              <template #content>
                {{ getTierLabel(log.data.old.tier) }}
              </template>
            </UPopover>
            <span class="text-sm font-semibold">
              <span>{{ getTierLabel(log.data.old.tier) }}</span>
              <span v-if="!isApexTier(log.data.old.tier)">&nbsp;{{ log.data.old.division }}</span>
            </span>
          </div>
          <Icon name="lucide:arrow-right" />
          <div class="flex items-center gap-2">
            <UPopover mode="hover" :content="{ side: 'top' }" arrow>
              <UButton variant="link" class="p-0">
                <img
                  :src="getTierImage(log.data.new.tier)"
                  class="w-8 h-8"
                  :alt="getTierLabel(log.data.new.tier)"
                >
              </UButton>
              <template #content>
                {{ getTierLabel(log.data.new.tier) }}
              </template>
            </UPopover>
            <span class="text-sm font-semibold">
              <span>{{ getTierLabel(log.data.new.tier) }}</span>
              <span v-if="!isApexTier(log.data.new.tier)">&nbsp;{{ log.data.new.division }}</span>
            </span>
          </div>
        </div>
        <UPopover mode="hover" :content="{ side: 'top' }" arrow>
          <UButton variant="link" color="neutral" class="text-xs text-muted p-0">
            <NuxtTime
              :datetime="log.createdAt"
              year="numeric"
              month="short"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
            />
          </UButton>
          <template #content>
            <span> {{ useTimeAgoIntl(log.createdAt, { locale: "es" }) }} </span>
          </template>
        </UPopover>
      </div>
      <div v-if="hasMore" class="flex justify-center">
        <UButton
          variant="soft"
          color="neutral"
          :loading="isLoading"
          :disabled="isLoading"
          trailing-icon="lucide:chevron-down"
          class="w-full sm:w-auto justify-center"
          :label="isLoading ? 'Cargando...' : 'Mostrar más'"
          @click="loadMore"
        />
      </div>

      <div v-else-if="logs.length > 0" class="text-center py-4 text-muted text-sm">No hay más actividad para mostrar</div>
    </div>
  </div>
</template>
